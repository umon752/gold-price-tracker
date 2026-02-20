export function usePortfolio() {
  const portfolioStore = usePortfolioStore()

  onMounted(async () => {
    await portfolioStore.init()
  })

  return portfolioStore
}
