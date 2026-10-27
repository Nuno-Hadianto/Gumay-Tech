import type { Settings, ServiceOrder, ServiceItem, Payment } from '../../shared/types'

const formatDateSafe = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  try {
    const normalized = dateStr.endsWith('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`
    const d = new Date(normalized)
    return isNaN(d.getTime()) ? new Date(dateStr).toLocaleDateString('id-ID') : d.toLocaleDateString('id-ID')
  } catch {
    return dateStr
  }
}

export const generateNotaHtml = (
  settings: Partial<Settings> | null,
  service: Partial<ServiceOrder> | null,
  logoBase64: string | null
) => {
  settings = settings || {}
  return `
        <div class="print-nota nota-wrapper">
            <!-- Header -->
            <div class="nota-header">
                <div class="nota-header-left">
                    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="nota-logo" />` : ''}
                    <div class="nota-biz-info">
                        <h2 class="nota-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                        <div class="nota-biz-addr">📍 ${settings.address || ''}</div>
                        <div class="nota-biz-phone">📞 ${settings.whatsapp || settings.phone || ''}</div>
                    </div>
                </div>
                <div class="nota-header-right">
                    <h1 class="nota-title">TANDA TERIMA</h1>
                    <div class="nota-no"><strong>No:</strong> ${service ? service.ticket_number : '...................................'}</div>
                    <div class="nota-date">Tanggal: ${service ? formatDateSafe(service.created_at) : '...................................'}</div>
                </div>
            </div>
            
            <!-- Body: 3 Columns -->
            <div class="nota-body">
                <!-- Pelanggan -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Pelanggan</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Nama</td><td>: <strong>${service ? service.customer_name : '............................'}</strong></td></tr>
                        <tr><td class="nota-label">No. HP</td><td>: ${service ? service.customer_phone || '-' : '............................'}</td></tr>
                        <tr><td class="nota-label">Alamat</td><td>: ${service ? service.customer_address || '-' : '............................'}</td></tr>
                    </table>
                </div>
                
                <!-- Perangkat -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Perangkat</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Jenis</td><td>: <strong>${service ? service.device_type : '............................'}</strong></td></tr>
                        <tr><td class="nota-label">Merk/Tipe</td><td>: ${service ? (service.brand || '') + ' ' + (service.model || '') : '............................'}</td></tr>
                        <tr><td class="nota-label">SN</td><td>: ${service ? service.serial_number || '-' : '............................'}</td></tr>
                    </table>
                </div>
                
                <!-- Keluhan -->
                <div class="nota-col" style="flex: 1.5;">
                    <h4 class="nota-col-title">Keluhan / Kerusakan</h4>
                    <div class="nota-complaint" style="white-space: pre-wrap;">${
                      service
                        ? (() => {
                            let out = ''
                            const txt = service.customer_complaint || ''
                            const sep = '\\n\\n[Kelengkapan & Kondisi Fisik]:\\n'
                            const idx = txt.indexOf(sep)
                            if (idx !== -1) {
                              out += txt.substring(0, idx)
                              if (!service.accessories && !service.physical_condition) {
                                out +=
                                  '<br/><br/><strong>Kelengkapan & Kondisi Fisik (Legacy):</strong><br/>' +
                                  txt.substring(idx + sep.length)
                              }
                            } else {
                              out += txt
                            }
                            if (service.accessories)
                              out +=
                                '<br/><br/><strong>Kelengkapan:</strong> ' + service.accessories
                            if (service.physical_condition)
                              out +=
                                '<br/><br/><strong>Kondisi Fisik:</strong> ' +
                                service.physical_condition
                            return (
                              out ||
                              '..................................................<br/>..................................................<br/>..................................................'
                            )
                          })()
                        : '..................................................<br/>..................................................<br/>..................................................'
                    }</div>
                </div>
            </div>
            
            <div class="nota-footer">
                <div class="nota-terms">
                    <h4>Syarat & Ketentuan:</h4>
                    <ol>
                        <li>Nota ini adalah bukti sah penyerahan barang. Harap dibawa saat pengambilan.</li>
                        <li>Barang yang tidak diambil dalam 30 hari sejak selesai servis bukan tanggung jawab kami.</li>
                        <li>Kerusakan data / kehilangan data di luar tanggung jawab kami. Mohon backup data Anda.</li>
                    </ol>
                </div>
                
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Hormat Kami,</div>
                    <img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain; margin: 10px 0;" alt="Tanda Tangan" />
                    <div class="nota-sig-line">${settings.business_name || 'Toko'}</div>
                </div>
                
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Pelanggan,</div>
                    <div class="nota-sig-line">${service ? service.customer_name : '............................'}</div>
                </div>
            </div>
        </div>
    `
}

export const generateInvoiceHtml = (
  settings: Partial<Settings> | null,
  service: Partial<ServiceOrder>,
  items: Partial<ServiceItem>[] | null,
  payments: Partial<Payment>[] | null,
  logoBase64: string | null
) => {
  settings = settings || {}
  const formatRp = (val: number | string | undefined | null) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(val || 0))

  let itemsHtml = ''
  if (items && items.length > 0) {
    items.forEach((i: Partial<ServiceItem> & { part_name?: string }) => {
      let desc = i.description
      if (i.item_type === 'Sparepart') desc = i.part_name || desc
      itemsHtml += `
                <tr class="inv-tr">
                    <td class="inv-td-desc">
                        <div class="inv-item-title">${desc}</div>
                        <div class="inv-item-sub">${i.item_type} &bull; Qty: ${i.quantity} &bull; ${formatRp(i.price)}/item</div>
                    </td>
                    <td class="inv-td-amount">${formatRp(i.total)}</td>
                </tr>
            `
    })
  } else {
    itemsHtml = `<tr><td colspan="2" class="inv-empty">Belum ada rincian biaya.</td></tr>`
  }

  let totalPaid = 0
  if (payments && payments.length > 0) {
    totalPaid = payments.reduce((acc: number, p: Partial<Payment>) => acc + (p.amount || 0), 0)
  }
  const remaining = (service.total_cost || 0) - totalPaid

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="Logo" class="inv-logo" />`
    : `<div class="inv-logo-placeholder">${(settings.business_name || 'N').charAt(0)}</div>`

  return `
        <div class="print-invoice invoice-box">
            <!-- Header Section -->
            <div class="inv-header">
                <div class="inv-header-left">
                    ${logoHtml}
                    <div class="inv-biz-info">
                        <h2 class="inv-biz-name">${settings.business_name || 'NUNOX SERVIS'}</h2>
                        <div class="inv-biz-addr">📍 ${settings.address || ''}</div>
                        <div class="inv-biz-phone">${settings.whatsapp || settings.phone || ''}</div>
                    </div>
                </div>
                <div class="inv-header-right">
                    <h1 class="inv-title">INVOICE</h1>
                    <div class="inv-meta-box">
                        <div class="inv-meta-label">No. Tiket</div>
                        <div class="inv-meta-value">${service.ticket_number}</div>
                        <div class="inv-meta-label inv-meta-label-mt">Tanggal</div>
                        <div class="inv-meta-value-sm">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </div>
            
            <!-- Customer & Device Info -->
            <div class="inv-info-row">
                <div class="inv-info-card">
                    <div class="inv-info-title">Tagihan Kepada</div>
                    <div class="inv-info-main">${service.customer_name}</div>
                    <div class="inv-info-sub">${service.customer_phone || '-'}</div>
                </div>
                <div class="inv-info-card">
                    <div class="inv-info-title">Informasi Perangkat</div>
                    <div class="inv-info-main">${service.device_type} ${service.brand || ''}</div>
                    <div class="inv-info-sub">${service.model || '-'}</div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="inv-table">
                <thead>
                    <tr>
                        <th class="inv-th-left">Deskripsi Layanan / Suku Cadang</th>
                        <th class="inv-th-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <!-- Summary & Totals -->
            <div class="inv-summary-row">
                <div class="inv-totals-box">
                    <table class="inv-totals-table">
                        <tr>
                            <td class="inv-tot-label">Total Biaya:</td>
                            <td class="inv-tot-val">${formatRp(service.total_cost || 0)}</td>
                        </tr>
                        <tr>
                            <td class="inv-tot-label">Telah Dibayar:</td>
                            <td class="inv-tot-val-paid">${formatRp(totalPaid)}</td>
                        </tr>
                        <tr><td colspan="2"><hr class="inv-tot-hr"></td></tr>
                        <tr>
                            <td class="inv-bal-label">Sisa Tagihan:</td>
                            <td class="inv-bal-val ${remaining > 0 ? 'inv-bal-unpaid' : 'inv-bal-paid'}">${formatRp(Math.max(0, remaining))}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Signatures -->
            <div class="inv-signatures">
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Pelanggan</div>
                    <div class="nota-sig-line">${service.customer_name}</div>
                </div>
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Hormat Kami</div>
                    <img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain; margin: 10px 0;" alt="Tanda Tangan" />
                    <div class="nota-sig-line">${settings.business_name || 'NUNOX'}</div>
                </div>
            </div>
        </div>
    `
}

export const printHtml = async (
  html: string,
  landscape: boolean = false
) => {
  const printArea = document.getElementById('print-area')
  if (printArea) {
    printArea.innerHTML = html

    // Wait for images to load before printing
    const images = printArea.querySelectorAll('img')
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    })
    await Promise.all(imagePromises)

    // Give browser a tiny delay to ensure paint is complete
    await new Promise((resolve) => setTimeout(resolve, 50))

    let styleTag = document.getElementById('dynamic-print-style')
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = 'dynamic-print-style'
      document.head.appendChild(styleTag)
    }
    styleTag.innerHTML = landscape
      ? '@media print { @page { size: A5 landscape; } }'
      : '@media print { @page { size: A4 portrait; } }'

    if (window.api && window.api.printPreview) {
      try {
        const pdfOptions: Record<string, boolean | string> = {
          landscape,
          pageSize: landscape ? 'A5' : 'A4'
        }
        await window.api.printPreview(pdfOptions)
      } catch (err) {
        console.error('Print preview error:', err)
      }
    } else {
      // Fallback for native browser
      window.print()
    }
    printArea.innerHTML = ''
    if (styleTag) styleTag.innerHTML = ''
  }
}

export const exportHtmlToPdf = async (html: string, filename: string) => {
  if (window.api && window.api.exportPdf) {
    return await window.api.exportPdf({ html, filename })
  }
  return { success: false, error: 'API exportPdf not found' }
}

