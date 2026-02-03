export const DEFAULT_SETTINGS = {
    materialWaste: 7,
    fabMultipliers: {
        1: 40,
        2: 65,
        3: 95
    },
    instMultipliers: {
        1: 30,
        2: 50,
        3: 75
    },
    finishAdder: {
        mode: 'percent', // 'percent' or 'fixed'
        value: 20
    },
    rentalAdder: {
        mode: 'percent', // 'percent' or 'fixed'
        value: 10
    },
    commissionRate: 10,
    profitMargins: {
        conservative: 40,
        fair: 35,
        friends: 30
    },
    taxRate: 7
};

export const calculateEstimate = (materials, settings, options) => {
    const {
        fabComplexity,
        instComplexity,
        hasSpecialFinish,
        hasRental,
        finishOverride = null,
        rentalOverride = null,
        equipmentRental = 0, // Dedicated field
        scope = 'full', // 'full', 'fab', 'inst', 'service'
        commissionRateOverride = null
    } = options;

    const commissionRate = commissionRateOverride !== null ? commissionRateOverride : settings.commissionRate;

    // M = Materials Subtotal
    const materialsSubtotal = materials.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    // Waste%
    const wastePercent = settings.materialWaste / 100;

    // Mw = M * (1 + Waste%)
    const materialsWithWaste = materialsSubtotal * (1 + wastePercent);

    // Fab% / Inst%
    const fabPercent = settings.fabMultipliers[fabComplexity] / 100;
    const instPercent = settings.instMultipliers[instComplexity] / 100;

    // FinishAdder
    let finishAdder = 0;
    if (hasSpecialFinish) {
        const mode = finishOverride?.mode || settings.finishAdder.mode;
        const val = finishOverride?.value !== undefined ? finishOverride.value : settings.finishAdder.value;
        if (mode === 'percent') {
            finishAdder = materialsWithWaste * (val / 100);
        } else {
            finishAdder = val;
        }
    }

    // Layer costs (cost-side)
    const isFabInScope = scope === 'full' || scope === 'fab';
    const isInstInScope = scope === 'full' || scope === 'inst';

    const fabCost = isFabInScope ? (materialsWithWaste * fabPercent) : 0;
    let instCost = isInstInScope ? (materialsWithWaste * instPercent) : 0;

    // Installation Minimum: $450
    if (isInstInScope && instCost > 0 && instCost < 450) {
        instCost = 450;
    }

    // RentalAdder (Total)
    let calculatedRental = 0;
    if (hasRental) {
        const mode = rentalOverride?.mode || settings.rentalAdder.mode;
        const val = rentalOverride?.value !== undefined ? rentalOverride.value : settings.rentalAdder.value;
        if (mode === 'percent') {
            calculatedRental = materialsWithWaste * (val / 100);
        } else {
            calculatedRental = val;
        }
    }
    const rentalAdder = calculatedRental + equipmentRental;

    // C_Base = Mw + FabCost + InstCost + FinishAdder + RentalAdder
    const subtotalCostBasis = materialsWithWaste + fabCost + instCost + finishAdder + rentalAdder;

    // Compute Selling Prices
    const variants = Object.entries(settings.profitMargins).reduce((acc, [key, margin]) => {
        const p = margin / 100;
        const c = commissionRate / 100;

        // Formula: SellingPrice = Cost / (1 - Margin - Comm)
        const denominator = 1 - p - c;
        let sellingPriceBeforeTax = 0;
        let commissionAmount = 0;
        let profitAmount = 0;
        let taxes = 0;
        let totalSellingPrice = 0;
        let profitPercentOfTotal = 0;

        if (denominator > 0) {
            sellingPriceBeforeTax = subtotalCostBasis / denominator;
            commissionAmount = sellingPriceBeforeTax * c;
            profitAmount = sellingPriceBeforeTax * p;
            taxes = sellingPriceBeforeTax * (settings.taxRate / 100);
            totalSellingPrice = sellingPriceBeforeTax + taxes;
            profitPercentOfTotal = (profitAmount / totalSellingPrice) * 100;
        }

        acc[key] = {
            margin,
            commissionRate,
            sellingPriceBeforeTax,
            taxes,
            totalSellingPrice,
            profitAmount,
            commissionAmount,
            profitPercentOfTotal
        };
        return acc;
    }, {});

    return {
        materialsSubtotal,
        materialsWithWaste,
        fabCost,
        instCost,
        finishAdder,
        rentalAdder,
        subtotalCostBasis,
        commissionRate,
        variants,
        scope
    };
};

export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(val);
};

export const formatPercent = (val) => {
    return `${val}%`;
};
