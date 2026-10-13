import { ref, computed } from 'vue'

export interface DataTableOptions<T> {
  fetchFn: (
    search: string,
    page: number,
    limit: number,
    sort: string
  ) => Promise<{ data: T[]; total: number; page?: number } | T[]>
  itemsPerPage?: number
  defaultSort?: string
  cacheData?: { data: T[]; total: number; hasCached: boolean }
  setCache?: (data: T[], total: number) => void
}

export function useDataTable<T>(options: DataTableOptions<T>) {
  const items = ref<T[]>([]) as import('vue').Ref<T[]>
  const searchQuery = ref<string>('')
  const sortBy = ref<string>(options.defaultSort || 'id_desc')

  const currentPage = ref<number>(1)
  const itemsPerPage = options.itemsPerPage || 50
  const totalItems = ref<number>(0)

  const totalPages = computed<number>(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

  const isLoading = ref<boolean>(false)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const loadData = async (page: number = 1) => {
    const isDefaultSort = sortBy.value === (options.defaultSort || 'id_desc')
    const hasCache =
      page === 1 && searchQuery.value === '' && isDefaultSort && !!options.cacheData?.hasCached

    // Stale-While-Revalidate: Jika data cache tersedia, tampilkan seketika agar UI instan tanpa loading spinner
    if (hasCache && options.cacheData) {
      items.value = [...options.cacheData.data]
      totalItems.value = options.cacheData.total
      currentPage.value = 1
      isLoading.value = false
    } else {
      isLoading.value = true
    }

    try {
      const result = await options.fetchFn(searchQuery.value, page, itemsPerPage, sortBy.value)

      // Some APIs return directly array without pagination if it's not paginated.
      if (Array.isArray(result)) {
        items.value = result
        totalItems.value = result.length
        currentPage.value = 1
      } else {
        items.value = result.data || []
        totalItems.value = result.total || 0
        currentPage.value = result.page || 1
      }

      // Simpan ke cache jika di page 1, tanpa query pencarian, dan sort default
      if (page === 1 && searchQuery.value === '' && isDefaultSort && options.setCache) {
        options.setCache(items.value, totalItems.value)
      }
    } catch (error) {
      console.error('Failed to load data in data table:', error)
    } finally {
      isLoading.value = false
    }
  }

  const debounceSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      loadData(1)
    }, 300)
  }

  return {
    items,
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    isLoading,
    loadData,
    debounceSearch
  }
}
