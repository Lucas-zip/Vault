package com.projeto.vault.service;

import com.projeto.vault.dto.request.InvestmentSimulationRequest;
import com.projeto.vault.dto.response.EvolutionPointResponse;
import com.projeto.vault.dto.response.InvestmentSimulationResponse;
import com.projeto.vault.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Calculadora de investimentos (juros compostos com aportes mensais),
 * inspirada na calculadora "Primeiro Milhão" do Investidor10.
 *
 * <p>Modelo matemático (valor futuro de uma série uniforme):</p>
 *
 * <pre>
 *   FV = PV * (1 + r)^n  +  PMT * ((1 + r)^n - 1) / r
 * </pre>
 *
 * <p>Onde {@code PV} é o patrimônio inicial, {@code PMT} o aporte mensal,
 * {@code r} a taxa mensal (decimal) e {@code n} o número de meses.
 * A taxa anual informada pelo usuário é convertida para mensal pela
 * equivalência composta: {@code r_mensal = (1 + taxa_anual)^(1/12) - 1}.</p>
 *
 * <p><strong>Aviso:</strong> os resultados são estimativas baseadas em
 * uma rentabilidade constante; não representam garantia de retorno.</p>
 */
@Component
public class InvestmentCalculator {

    private static final MathContext MC = new MathContext(20, RoundingMode.HALF_UP);
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final int MONTHS_PER_YEAR = 12;
    /** Teto de meses simulados para evitar laços infinitos. */
    private static final int MAX_MONTHS = 1200; // 100 anos
    /** Limite de pontos na série de evolução (amostragem anual quando longa). */
    private static final int MAX_EVOLUTION_POINTS = 600;

    private static final String DISCLAIMER =
            "Os valores apresentados são estimativas baseadas em uma rentabilidade "
                    + "constante e não representam garantia de retorno. Rentabilidades "
                    + "passadas não garantem resultados futuros.";

    public InvestmentSimulationResponse simulate(InvestmentSimulationRequest request) {
        BigDecimal pv = nonNegative(request.getInitialAmount());
        BigDecimal fv = request.getTargetAmount();
        BigDecimal pmt = nonNegative(request.getMonthlyContribution());
        BigDecimal rate = request.getRate();
        int months = request.getMonths() != null ? request.getMonths() : 0;

        BigDecimal monthlyRate = toMonthlyRate(rate, request.getRatePeriod());

        if (fv.compareTo(pv) <= 0) {
            throw new BusinessException(
                    "O patrimônio desejado deve ser maior que o patrimônio inicial");
        }

        BigDecimal requiredContribution = null;
        if (months > 0) {
            requiredContribution = requiredMonthlyContribution(pv, fv, monthlyRate, months);
            // Para projeção com prazo definido, simula com o aporte necessário
            pmt = requiredContribution;
        }

        // Meses necessários para atingir o objetivo com o aporte informado.
        int monthsToGoal = monthsToReach(pv, fv, pmt, monthlyRate);
        if (monthsToGoal <= 0) {
            monthsToGoal = months > 0 ? months : 1;
        }

        List<EvolutionPointResponse> evolution =
                buildEvolution(pv, pmt, monthlyRate, monthsToGoal);

        EvolutionPointResponse last = evolution.get(evolution.size() - 1);

        return InvestmentSimulationResponse.builder()
                .monthlyRate(monthlyRate.setScale(8, RoundingMode.HALF_UP))
                .monthsToGoal(monthsToGoal)
                .yearsToGoal(monthsToGoal / MONTHS_PER_YEAR)
                .remainingMonths(monthsToGoal % MONTHS_PER_YEAR)
                .totalInvested(last.getInvested())
                .totalInterest(last.getInterest())
                .finalAmount(last.getBalance())
                .requiredMonthlyContribution(
                        requiredContribution != null
                                ? requiredContribution.setScale(2, RoundingMode.HALF_UP)
                                : null)
                .evolution(evolution)
                .disclaimer(DISCLAIMER)
                .build();
    }

    /**
     * Converte a rentabilidade informada para taxa mensal decimal.
     * Suporta periodicidade ANNUAL (padrão) e MONTHLY.
     */
    public BigDecimal toMonthlyRate(BigDecimal rate, String ratePeriod) {
        if (rate == null) {
            throw new BusinessException("A rentabilidade é obrigatória");
        }
        if (rate.compareTo(BigDecimal.valueOf(-100)) <= 0) {
            throw new BusinessException("A rentabilidade deve ser maior que -100%");
        }

        boolean monthly = "MONTHLY".equalsIgnoreCase(ratePeriod);
        BigDecimal decimal = rate.divide(HUNDRED, MC);

        if (monthly) {
            return decimal;
        }
        // Equivalência composta: r_m = (1 + r_a)^(1/12) - 1
        double annual = decimal.doubleValue();
        double monthlyDouble = Math.pow(1.0 + annual, 1.0 / MONTHS_PER_YEAR) - 1.0;
        return BigDecimal.valueOf(monthlyDouble);
    }

    /**
     * Calcula o aporte mensal necessário (PMT) para atingir {@code fv}
     * em {@code n} meses, dado o patrimônio inicial {@code pv}.
     *
     * <pre>
     *   PMT = (FV - PV*(1+r)^n) * r / ((1+r)^n - 1)
     * </pre>
     *
     * <p>Quando a taxa é zero, PMT = (FV - PV) / n. Se o patrimônio inicial
     * já permite atingir o alvo, o aporte necessário é zero.</p>
     */
    public BigDecimal requiredMonthlyContribution(BigDecimal pv, BigDecimal fv,
                                                  BigDecimal monthlyRate, int months) {
        if (months <= 0) {
            throw new BusinessException("O prazo deve ser maior que zero");
        }

        double r = monthlyRate.doubleValue();
        BigDecimal monthsBd = BigDecimal.valueOf(months);

        if (Math.abs(r) < 1e-12) {
            BigDecimal needed = fv.subtract(pv);
            if (needed.compareTo(BigDecimal.ZERO) <= 0) {
                return BigDecimal.ZERO;
            }
            return needed.divide(monthsBd, 2, RoundingMode.HALF_UP);
        }

        double growth = Math.pow(1.0 + r, months);           // (1+r)^n
        double futureOfPv = pv.doubleValue() * growth;       // PV*(1+r)^n
        double remaining = fv.doubleValue() - futureOfPv;

        if (remaining <= 0) {
            return BigDecimal.ZERO;
        }

        double pmt = remaining * r / (growth - 1.0);
        return BigDecimal.valueOf(pmt);
    }

    /**
     * Encontra o número de meses necessários para {@code balance >= fv}.
     * Usa fechamento analítico quando há aporte e {@code r > 0}; caso
     * contrário, itera mês a mês.
     */
    public int monthsToReach(BigDecimal pv, BigDecimal fv, BigDecimal pmt, BigDecimal monthlyRate) {
        double rate = monthlyRate.doubleValue();
        double pvD = pv.doubleValue();
        double pmtD = pmt.doubleValue();
        double fvD = fv.doubleValue();

        if (pvD >= fvD) {
            return 0;
        }
        // Sem aporte e rentabilidade não positiva: nunca alcança.
        if (pmtD <= 0 && rate <= 0) {
            return MAX_MONTHS;
        }

        if (rate > 0 && pmtD > 0) {
            // n = ln((FV*r + PMT) / (PV*r + PMT)) / ln(1+r)
            double numerator = Math.log((fvD * rate + pmtD) / (pvD * rate + pmtD));
            double denominator = Math.log(1.0 + rate);
            if (denominator != 0) {
                double n = numerator / denominator;
                if (n > 0 && Double.isFinite(n)) {
                    return (int) Math.ceil(n);
                }
            }
        }

        // Fallback iterativo.
        double balance = pvD;
        for (int month = 1; month <= MAX_MONTHS; month++) {
            balance = balance * (1.0 + rate) + pmtD;
            if (balance >= fvD) {
                return month;
            }
        }
        return MAX_MONTHS;
    }

    /**
     * Constrói a série de evolução do patrimônio mês a mês (investido,
     * juros e saldo). Amostra pontos quando o prazo é muito longo.
     */
    private List<EvolutionPointResponse> buildEvolution(BigDecimal pv, BigDecimal pmt,
                                                        BigDecimal monthlyRate, int months) {
        List<EvolutionPointResponse> points = new ArrayList<>();
        double rate = monthlyRate.doubleValue();
        BigDecimal balance = pv;
        BigDecimal invested = pv;

        int step = Math.max(1, (int) Math.ceil((double) months / MAX_EVOLUTION_POINTS));

        // Ponto inicial (mês 0)
        points.add(point(0, invested, balance));

        for (int month = 1; month <= months; month++) {
            balance = balance.multiply(BigDecimal.ONE.add(monthlyRate), MC);
            balance = balance.add(pmt);
            invested = invested.add(pmt);

            if (month % step == 0 || month == months) {
                points.add(point(month, invested, balance));
            }
        }
        return points;
    }

    private EvolutionPointResponse point(int month, BigDecimal invested, BigDecimal balance) {
        BigDecimal interest = balance.subtract(invested);
        return EvolutionPointResponse.builder()
                .month(month)
                .year((month / MONTHS_PER_YEAR) + 1)
                .invested(invested.setScale(2, RoundingMode.HALF_UP))
                .interest(interest.setScale(2, RoundingMode.HALF_UP))
                .balance(balance.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : value;
    }
}
