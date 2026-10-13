export const ReportService = {
  async getIncomeReport(
    start: string,
    end: string
  ): Promise<{ total_income: number; transaction_count: number }> {
    if (!window.api?.getIncomeReport) throw new Error('API not available')
    return window.api.getIncomeReport(start, end)
  },

  async getCompletedServices(start: string, end: string): Promise<Record<string, unknown>[]> {
    if (!window.api?.getCompletedServices) throw new Error('API not available')
    return window.api.getCompletedServices(start, end)
  },

  async getTopSpareparts(start: string, end: string): Promise<Record<string, unknown>[]> {
    if (!window.api?.getTopSpareparts) throw new Error('API not available')
    return window.api.getTopSpareparts(start, end)
  },

  async getReportBreakdown(
    start: string,
    end: string
  ): Promise<{
    jasa: { omset: number; modal: number }
    sparepart: { omset: number; modal: number }
    lainnya: { omset: number; modal: number }
  }> {
    if (!window.api?.getReportBreakdown) throw new Error('API not available')
    return window.api.getReportBreakdown(start, end)
  }
}
