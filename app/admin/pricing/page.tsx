"use client";

import { useState } from "react";

// AI Provider pricing data - these can be updated via the UI
interface AIModel {
  name: string;
  inputPer1M: number;
  outputPer1M: number;
  contextWindow: string;
  pricingUrl: string;
  lastUpdated: string;
  notes: string;
}

interface AIProvider {
  provider: string;
  models: AIModel[];
}

const initialAIProviders: AIProvider[] = [
  {
    provider: "Anthropic",
    models: [
      {
        name: "Claude Sonnet 4.5",
        inputPer1M: 3.0,
        outputPer1M: 15.0,
        contextWindow: "200K",
        pricingUrl: "https://www.anthropic.com/pricing",
        lastUpdated: "2025-11-29",
        notes: "Best for long-form technical content",
      },
      {
        name: "Claude Opus 4.5",
        inputPer1M: 5.0,
        outputPer1M: 25.0,
        contextWindow: "200K",
        pricingUrl: "https://www.anthropic.com/pricing",
        lastUpdated: "2025-11-29",
        notes: "Premium model, 66% cheaper than Opus 4.1",
      },
      {
        name: "Claude Haiku 3.5",
        inputPer1M: 0.8,
        outputPer1M: 4.0,
        contextWindow: "200K",
        pricingUrl: "https://www.anthropic.com/pricing",
        lastUpdated: "2025-11-29",
        notes: "Fast and cheap for simple tasks",
      },
    ],
  },
  {
    provider: "OpenAI",
    models: [
      {
        name: "GPT-5",
        inputPer1M: 1.25,
        outputPer1M: 10.0,
        contextWindow: "272K",
        pricingUrl: "https://openai.com/api/pricing/",
        lastUpdated: "2025-11-29",
        notes: "Latest flagship, 30-40% cheaper than GPT-4o",
      },
      {
        name: "GPT-5 Mini",
        inputPer1M: 0.25,
        outputPer1M: 2.0,
        contextWindow: "128K",
        pricingUrl: "https://openai.com/api/pricing/",
        lastUpdated: "2025-11-29",
        notes: "Good balance of cost and quality",
      },
      {
        name: "GPT-5 Nano",
        inputPer1M: 0.05,
        outputPer1M: 0.4,
        contextWindow: "64K",
        pricingUrl: "https://openai.com/api/pricing/",
        lastUpdated: "2025-11-29",
        notes: "Cheapest OpenAI option",
      },
      {
        name: "GPT-4o",
        inputPer1M: 5.0,
        outputPer1M: 20.0,
        contextWindow: "128K",
        pricingUrl: "https://openai.com/api/pricing/",
        lastUpdated: "2025-11-29",
        notes: "Legacy model, being phased out",
      },
    ],
  },
  {
    provider: "Google",
    models: [
      {
        name: "Gemini 2.5 Pro",
        inputPer1M: 1.25,
        outputPer1M: 10.0,
        contextWindow: "1M",
        pricingUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        lastUpdated: "2025-11-29",
        notes: "Best for complex reasoning",
      },
      {
        name: "Gemini 2.5 Flash",
        inputPer1M: 0.15,
        outputPer1M: 0.6,
        contextWindow: "1M",
        pricingUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        lastUpdated: "2025-11-29",
        notes: "Great balance of speed and cost",
      },
      {
        name: "Gemini 2.0 Flash",
        inputPer1M: 0.1,
        outputPer1M: 0.4,
        contextWindow: "1M",
        pricingUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        lastUpdated: "2025-11-29",
        notes: "CHEAPEST OPTION - Recommended default",
      },
    ],
  },
];

// Book pricing structure
interface BookPricing {
  singleBookPrice: number;
  threeBookPrice: number;
  tenBookPrice: number;
  hostingRenewal: number;
  tokenCapPerBook: number;
  inputOutputRatio: number; // % that is input (rest is output)
}

const initialBookPricing: BookPricing = {
  singleBookPrice: 19.99,
  threeBookPrice: 44.97,
  tenBookPrice: 99.90,
  hostingRenewal: 19.99,
  tokenCapPerBook: 100000,
  inputOutputRatio: 0.2, // 20% input, 80% output
};

export default function AdminPricingPage() {
  const [aiProviders, setAIProviders] = useState<AIProvider[]>(initialAIProviders);
  const [bookPricing, setBookPricing] = useState<BookPricing>(initialBookPricing);
  const [defaultModel, setDefaultModel] = useState("Gemini 2.0 Flash");
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // Calculate cost for given tokens
  const calculateCost = (tokens: number, inputRate: number, outputRate: number) => {
    const inputTokens = tokens * bookPricing.inputOutputRatio;
    const outputTokens = tokens * (1 - bookPricing.inputOutputRatio);
    const inputCost = (inputTokens / 1_000_000) * inputRate;
    const outputCost = (outputTokens / 1_000_000) * outputRate;
    return inputCost + outputCost;
  };

  // Get model data
  const getModelData = (modelName: string) => {
    for (const provider of aiProviders) {
      const model = provider.models.find((m) => m.name === modelName);
      if (model) return { ...model, provider: provider.provider };
    }
    return null;
  };

  const defaultModelData = getModelData(defaultModel);
  const costPerBook = defaultModelData
    ? calculateCost(bookPricing.tokenCapPerBook, defaultModelData.inputPer1M, defaultModelData.outputPer1M)
    : 0;

  // Unit economics calculations
  const calculateUnitEconomics = (price: number, books: number) => {
    const totalCost = costPerBook * books;
    const grossProfit = price - totalCost;
    const grossMargin = (grossProfit / price) * 100;
    const pricePerBook = price / books;
    const profitPerBook = grossProfit / books;
    return { totalCost, grossProfit, grossMargin, pricePerBook, profitPerBook };
  };

  const singleEcon = calculateUnitEconomics(bookPricing.singleBookPrice, 1);
  const threeEcon = calculateUnitEconomics(bookPricing.threeBookPrice, 3);
  const tenEcon = calculateUnitEconomics(bookPricing.tenBookPrice, 10);

  // Update model pricing
  const updateModelPrice = (providerName: string, modelName: string, field: 'inputPer1M' | 'outputPer1M', value: number) => {
    setAIProviders(prev => prev.map(provider => {
      if (provider.provider === providerName) {
        return {
          ...provider,
          models: provider.models.map(model => {
            if (model.name === modelName) {
              return { ...model, [field]: value, lastUpdated: new Date().toISOString().split('T')[0] };
            }
            return model;
          })
        };
      }
      return provider;
    }));
  };

  // Fetch latest prices (simulated - would hit actual APIs in production)
  const fetchLatestPrices = async () => {
    setIsUpdating(true);
    // In production, this would fetch from the actual pricing pages
    // For now, we'll just update the timestamp
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastFetched(new Date().toLocaleString());
    setIsUpdating(false);
    alert("Prices verified! In production, this would fetch live prices from provider APIs.\n\nFor now, manually update prices using the edit buttons and check the links below.");
  };

  // Export config for use in app
  const exportConfig = () => {
    const config = {
      aiProviders,
      bookPricing,
      defaultModel,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-config.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin: Pricing & Unit Economics</h1>
            <p className="text-base-content/70 mt-1">
              Manage AI costs, book pricing, and calculate margins
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-primary gap-2 ${isUpdating ? 'loading' : ''}`}
              onClick={fetchLatestPrices}
              disabled={isUpdating}
            >
              {!isUpdating && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isUpdating ? 'Checking...' : 'Refresh Prices'}
            </button>
            <button className="btn btn-outline gap-2" onClick={exportConfig}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Config
            </button>
          </div>
        </div>

        {lastFetched && (
          <div className="alert alert-info mb-6">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last checked: {lastFetched}</span>
          </div>
        )}

        {/* Book Pricing Configuration */}
        <div className="bg-base-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Book Pricing Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Single Book</span>
              </label>
              <div className="input-group">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={bookPricing.singleBookPrice}
                  onChange={(e) => setBookPricing(prev => ({ ...prev, singleBookPrice: parseFloat(e.target.value) || 0 }))}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">3-Book Bundle</span>
              </label>
              <div className="input-group">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={bookPricing.threeBookPrice}
                  onChange={(e) => setBookPricing(prev => ({ ...prev, threeBookPrice: parseFloat(e.target.value) || 0 }))}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">10-Book Bundle</span>
              </label>
              <div className="input-group">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={bookPricing.tenBookPrice}
                  onChange={(e) => setBookPricing(prev => ({ ...prev, tenBookPrice: parseFloat(e.target.value) || 0 }))}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Hosting Renewal</span>
              </label>
              <div className="input-group">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={bookPricing.hostingRenewal}
                  onChange={(e) => setBookPricing(prev => ({ ...prev, hostingRenewal: parseFloat(e.target.value) || 0 }))}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tokens/Book</span>
              </label>
              <input
                type="number"
                step="10000"
                value={bookPricing.tokenCapPerBook}
                onChange={(e) => setBookPricing(prev => ({ ...prev, tokenCapPerBook: parseInt(e.target.value) || 0 }))}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Default Model</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
              >
                {aiProviders.map((provider) => (
                  <optgroup key={provider.provider} label={provider.provider}>
                    {provider.models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Unit Economics Dashboard */}
        <div className="bg-base-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Unit Economics (using {defaultModel})
          </h2>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Books</th>
                  <th>$/Book</th>
                  <th>AI Cost</th>
                  <th>Gross Profit</th>
                  <th>Profit/Book</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">Single Book</td>
                  <td>${bookPricing.singleBookPrice.toFixed(2)}</td>
                  <td>1</td>
                  <td>${singleEcon.pricePerBook.toFixed(2)}</td>
                  <td className="text-error">${singleEcon.totalCost.toFixed(3)}</td>
                  <td className="text-success font-bold">${singleEcon.grossProfit.toFixed(2)}</td>
                  <td>${singleEcon.profitPerBook.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${singleEcon.grossMargin > 90 ? 'badge-success' : singleEcon.grossMargin > 70 ? 'badge-warning' : 'badge-error'}`}>
                      {singleEcon.grossMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">3-Book Bundle</td>
                  <td>${bookPricing.threeBookPrice.toFixed(2)}</td>
                  <td>3</td>
                  <td>${threeEcon.pricePerBook.toFixed(2)}</td>
                  <td className="text-error">${threeEcon.totalCost.toFixed(3)}</td>
                  <td className="text-success font-bold">${threeEcon.grossProfit.toFixed(2)}</td>
                  <td>${threeEcon.profitPerBook.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${threeEcon.grossMargin > 90 ? 'badge-success' : threeEcon.grossMargin > 70 ? 'badge-warning' : 'badge-error'}`}>
                      {threeEcon.grossMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">10-Book Bundle</td>
                  <td>${bookPricing.tenBookPrice.toFixed(2)}</td>
                  <td>10</td>
                  <td>${tenEcon.pricePerBook.toFixed(2)}</td>
                  <td className="text-error">${tenEcon.totalCost.toFixed(3)}</td>
                  <td className="text-success font-bold">${tenEcon.grossProfit.toFixed(2)}</td>
                  <td>${tenEcon.profitPerBook.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${tenEcon.grossMargin > 90 ? 'badge-success' : tenEcon.grossMargin > 70 ? 'badge-warning' : 'badge-error'}`}>
                      {tenEcon.grossMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
                <tr className="bg-base-200">
                  <td className="font-bold">Hosting Renewal</td>
                  <td>${bookPricing.hostingRenewal.toFixed(2)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="text-success">$0.00</td>
                  <td className="text-success font-bold">${bookPricing.hostingRenewal.toFixed(2)}</td>
                  <td>-</td>
                  <td><span className="badge badge-success">100%</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-info/10 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> AI cost based on {(bookPricing.tokenCapPerBook / 1000).toFixed(0)}K tokens per book
              ({(bookPricing.inputOutputRatio * 100).toFixed(0)}% input, {((1 - bookPricing.inputOutputRatio) * 100).toFixed(0)}% output)
              using <strong>{defaultModel}</strong> at ${defaultModelData?.inputPer1M.toFixed(2)}/${defaultModelData?.outputPer1M.toFixed(2)} per 1M tokens.
            </p>
          </div>
        </div>

        {/* AI Provider Pricing */}
        <div className="bg-base-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI Provider Pricing (Click to Edit)
          </h2>

          {aiProviders.map((provider) => (
            <div key={provider.provider} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg">{provider.provider}</h3>
                <a
                  href={provider.models[0].pricingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xs btn-ghost gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Check Prices
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Input/1M</th>
                      <th>Output/1M</th>
                      <th>Context</th>
                      <th>Cost/Book</th>
                      <th>Margin @$19.99</th>
                      <th>Updated</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider.models.map((model) => {
                      const bookCost = calculateCost(bookPricing.tokenCapPerBook, model.inputPer1M, model.outputPer1M);
                      const margin = ((bookPricing.singleBookPrice - bookCost) / bookPricing.singleBookPrice) * 100;
                      const isEditing = editingModel === model.name;
                      const isDefault = model.name === defaultModel;

                      return (
                        <tr key={model.name} className={isDefault ? 'bg-primary/10' : ''}>
                          <td>
                            <div className="flex items-center gap-2">
                              {model.name}
                              {isDefault && <span className="badge badge-primary badge-xs">DEFAULT</span>}
                            </div>
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={model.inputPer1M}
                                onChange={(e) => updateModelPrice(provider.provider, model.name, 'inputPer1M', parseFloat(e.target.value) || 0)}
                                className="input input-xs input-bordered w-20"
                              />
                            ) : (
                              <span className="cursor-pointer hover:text-primary" onClick={() => setEditingModel(model.name)}>
                                ${model.inputPer1M.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={model.outputPer1M}
                                onChange={(e) => updateModelPrice(provider.provider, model.name, 'outputPer1M', parseFloat(e.target.value) || 0)}
                                className="input input-xs input-bordered w-20"
                              />
                            ) : (
                              <span className="cursor-pointer hover:text-primary" onClick={() => setEditingModel(model.name)}>
                                ${model.outputPer1M.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td>{model.contextWindow}</td>
                          <td className="font-mono">${bookCost.toFixed(3)}</td>
                          <td>
                            <span className={`badge ${margin > 95 ? 'badge-success' : margin > 90 ? 'badge-warning' : 'badge-error'}`}>
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-xs text-base-content/60">{model.lastUpdated}</td>
                          <td className="text-xs max-w-[200px] truncate">{model.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {editingModel && (
            <div className="mt-4">
              <button className="btn btn-sm btn-success" onClick={() => setEditingModel(null)}>
                Done Editing
              </button>
            </div>
          )}
        </div>

        {/* Scenario Calculator */}
        <div className="bg-base-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Scenario Calculator</h2>
          <p className="text-sm text-base-content/70 mb-4">
            What if you sell X books per month?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[10, 50, 100, 500].map((sales) => {
              // Assume distribution: 60% single, 25% 3-pack, 15% 10-pack
              const singleSales = Math.round(sales * 0.6);
              const threeSales = Math.round(sales * 0.25 / 3);
              const tenSales = Math.round(sales * 0.15 / 10);

              const revenue =
                singleSales * bookPricing.singleBookPrice +
                threeSales * bookPricing.threeBookPrice +
                tenSales * bookPricing.tenBookPrice;

              const totalBooks = singleSales + (threeSales * 3) + (tenSales * 10);
              const totalCost = totalBooks * costPerBook;
              const grossProfit = revenue - totalCost;

              return (
                <div key={sales} className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">{sales} books/month</div>
                  <div className="stat-value text-lg">${revenue.toFixed(0)}</div>
                  <div className="stat-desc">
                    <span className="text-success">+${grossProfit.toFixed(0)} profit</span>
                    <br />
                    <span className="text-xs">({totalBooks} total books)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-base-100 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Official Pricing Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://www.anthropic.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Anthropic (Claude)
            </a>
            <a
              href="https://openai.com/api/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              OpenAI (GPT)
            </a>
            <a
              href="https://ai.google.dev/gemini-api/docs/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Google (Gemini)
            </a>
          </div>
        </div>

        <p className="text-center text-base-content/50 text-sm mt-8">
          Internal admin page. Do not share publicly. Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
