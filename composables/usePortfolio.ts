export function usePortfolio() {
  const portfolioStore = usePortfolioStore()

  onMounted(() => {
    portfolioStore.init()
  })

  return portfolioStore
}
