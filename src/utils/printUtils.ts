import type { Settings, ServiceOrder, ServiceItem, Payment } from '../../shared/types'

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
                    <div class="nota-date">Tanggal: ${service ? new Date(service.created_at + 'Z').toLocaleDateString('id-ID') : '...................................'}</div>
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
                            let out = '';
                            const txt = service.customer_complaint || '';
                            const sep = '\\n\\n[Kelengkapan & Kondisi Fisik]:\\n';
                            const idx = txt.indexOf(sep);
                            if (idx !== -1) {
                                out += txt.substring(0, idx);
                                if (!service.accessories && !service.physical_condition) {
                                    out += '<br/><br/><strong>Kelengkapan & Kondisi Fisik (Legacy):</strong><br/>' + txt.substring(idx + sep.length);
                                }
                            } else {
                                out += txt;
                            }
                            if (service.accessories) out += '<br/><br/><strong>Kelengkapan:</strong> ' + service.accessories;
                            if (service.physical_condition) out += '<br/><br/><strong>Kondisi Fisik:</strong> ' + service.physical_condition;
                            return out || '..................................................<br/>..................................................<br/>..................................................';
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
                <div class="inv-notes-box">
                    <div class="inv-notes-title">Catatan Tambahan</div>
                    <div class="inv-notes-content">
                        ${settings.receipt_footer || 'Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami. Garansi servis berlaku selama 30 hari sejak tanggal pengambilan.'}
                    </div>
                </div>
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

export const generateReportHtml = (
  settings: Partial<Settings> | null,
  services: Partial<ServiceOrder>[],
  startDate: string,
  endDate: string,
  totalOmset: number,
  totalModal: number,
  netProfit: number,
  logoBase64: string | null,
  topParts: { part_name: string; total_sold: number }[] = []
) => {
  settings = settings || {}
  const formatRp = (val: number | string | undefined | null) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(val || 0))

  let rowsHtml = ''
  if (services && services.length > 0) {
    services.forEach((s: Partial<ServiceOrder>, idx: number) => {
      rowsHtml += `
                <tr>
                    <td class="rep-td-center">${idx + 1}</td>
                    <td class="rep-td">${s.ticket_number}</td>
                    <td class="rep-td">${new Date(s.completed_date + 'Z').toLocaleDateString('id-ID')}</td>
                    <td class="rep-td">${s.customer_name}</td>
                    <td class="rep-td">${s.brand || ''} ${s.model || ''}</td>
                    <td class="rep-td-right">${formatRp(s.total_cost)}</td>
                </tr>
            `
    })
  } else {
    rowsHtml = `<tr><td colspan="6" class="rep-td-center" style="padding: 15px;">Tidak ada transaksi</td></tr>`
  }

  let topPartsHtml = ''
  if (topParts && topParts.length > 0) {
    topPartsHtml = `
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h3 style="font-size: 14pt; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Peringkat 5 Sparepart Terlaris</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    ${topParts
                      .map(
                        (p: { part_name: string; total_sold: number }, i: number) => `
                        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 15px; flex: 1; min-width: 120px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                            <div style="font-size: 9pt; color: #64748b; font-weight: 600; margin-bottom: 4px;">Peringkat #${i + 1}</div>
                            <div style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 8px;">${p.part_name}</div>
                            <div style="font-size: 10pt; color: #10b981; font-weight: bold;">Terpakai: ${p.total_sold} unit</div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `
  } else {
    topPartsHtml = `
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h3 style="font-size: 14pt; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Peringkat 5 Sparepart Terlaris</h3>
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; color: #64748b; text-align: center;">Belum ada data penggunaan sparepart di periode ini.</div>
            </div>
        `
  }

  return `
        <div class="print-report" style="max-width: 100%; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px;">
                ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 70px; margin-bottom: 10px;" />` : ''}
                <h1 style="margin: 0; font-size: 24pt; color: #1e293b; letter-spacing: 1px;">LAPORAN KEUANGAN BULANAN</h1>
                <h2 style="margin: 5px 0 10px 0; font-size: 16pt; color: #475569;">${settings.business_name || 'NUNOX SERVIS'}</h2>
                <div style="display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 11pt;">Periode: ${startDate} s/d ${endDate}</div>
            </div>
            
            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #4f46e5; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Omset (Kotor)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #1e293b;">${formatRp(totalOmset)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #ef4444; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total HPP (Modal)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #ef4444;">${formatRp(totalModal)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #10b981; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Laba Bersih (Profit)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #10b981;">${formatRp(netProfit)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #f59e0b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Transaksi</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #f59e0b;">${services.length} Unit</div>
                </div>
            </div>
            
            ${topPartsHtml}
            
            <div style="margin-top: 30px;">
                <h3 style="font-size: 14pt; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Rincian Transaksi Selesai</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f1f5f9;">
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: center; color: #334155;">No</th>
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #334155;">No. Tiket</th>
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #334155;">Tgl Selesai</th>
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #334155;">Pelanggan</th>
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #334155;">Perangkat</th>
                            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #334155;">Total Biaya</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 50px; text-align: right; color: #64748b; font-size: 10pt;">
                <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
                <div style="margin-top: 10px;"><img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain;" alt="Tanda Tangan" /></div>
                <div style="margin-top: 10px; font-weight: bold;">( ${settings.business_name || 'Pemilik'} )</div>
            </div>
        </div>
    `
}

export const printHtml = async (
  html: string,
  landscape: boolean = false,
  isThermal: boolean = false
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
    if (isThermal) {
      styleTag.innerHTML = '@media print { @page { size: 58mm auto; margin: 0; } }'
    } else {
      styleTag.innerHTML = landscape
        ? '@media print { @page { size: A5 landscape; } }'
        : '@media print { @page { size: A4 portrait; } }'
    }

    if (window.api && window.api.printPreview) {
      try {
        const pdfOptions: Record<string, boolean | string> = { landscape: landscape && !isThermal }
        if (!isThermal) {
          pdfOptions.pageSize = landscape ? 'A5' : 'A4'
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

export const generateThermalNotaHtml = (
  settings: Partial<Settings> | null,
  service: Partial<ServiceOrder> | null,
  logoBase64: string | null
) => {
  settings = settings || {}
  return `
        <div class="print-thermal">
            <!-- Header -->
            <div class="thm-center">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="thm-logo" />` : ''}
                <div class="thm-bold thm-biz-name">${settings.business_name || 'NUNOX SERVIS'}</div>
                <div class="thm-biz-sub">📍 ${settings.address || ''}</div>
                <div class="thm-biz-sub">WA: ${settings.whatsapp || settings.phone || ''}</div>
            </div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-center thm-bold thm-title">TANDA TERIMA</div>
            
            <div class="thm-row">
                <span class="thm-label">No:</span>
                <span class="thm-val thm-bold">${service ? service.ticket_number : '-'}</span>
            </div>
            <div class="thm-row">
                <span class="thm-label">Tgl:</span>
                <span class="thm-val">${service ? new Date(service.created_at + 'Z').toLocaleDateString('id-ID') : '-'}</span>
            </div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">PELANGGAN:</div>
            <div>${service ? service.customer_name : '-'}</div>
            <div>${service ? service.customer_phone || '' : ''}</div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">PERANGKAT:</div>
            <div>${service ? service.device_type : '-'}</div>
            <div>${service ? (service.brand || '') + ' ' + (service.model || '') : '-'}</div>
            <div class="thm-row" style="margin-top: 2px;">
                <span class="thm-label">SN:</span>
                <span class="thm-val">${service ? service.serial_number || '-' : '-'}</span>
            </div>
            
            <div class="thm-dashed"></div>
            
            ${(() => {
                let out = '';
                const txt = service?.customer_complaint || '';
                const sep = '\\n\\n[Kelengkapan & Kondisi Fisik]:\\n';
                const idx = txt.indexOf(sep);
                if (idx !== -1) {
                    out += `
                        <div class="thm-bold thm-section-title">KELUHAN:</div>
                        <div class="thm-text" style="white-space: pre-wrap;">${txt.substring(0, idx)}</div>
                    `;
                    if (!service?.accessories && !service?.physical_condition) {
                        out += `
                            <br/>
                            <div class="thm-bold thm-section-title" style="margin-top: 5px;">KELENGKAPAN (Lama):</div>
                            <div class="thm-text" style="white-space: pre-wrap;">${txt.substring(idx + sep.length)}</div>
                        `;
                    }
                } else {
                    out += `
                        <div class="thm-bold thm-section-title">KELUHAN:</div>
                        <div class="thm-text" style="white-space: pre-wrap;">${txt}</div>
                    `;
                }
                
                if (service?.physical_condition) {
                    out += `
                        <br/>
                        <div class="thm-bold thm-section-title" style="margin-top: 5px;">KONDISI FISIK:</div>
                        <div class="thm-text" style="white-space: pre-wrap;">${service.physical_condition}</div>
                    `;
                }
                
                return out;
            })()}
            
            <div class="thm-dashed"></div>
            
            <div class="thm-bold thm-section-title">KELENGKAPAN:</div>
            <div class="thm-text-sm">${service?.accessories ? service.accessories : '-'}</div>
            
            <div class="thm-dashed"></div>
            
            <div class="thm-center thm-sig">
                <div>Hormat Kami,</div>
                <img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain; margin: 10px 0;" alt="Tanda Tangan" />
                <div>( .................... )</div>
            </div>
            
            <div class="thm-center thm-footer">
                * Harap bawa struk ini saat mengambil barang.
            </div>
            <div class="thm-gap"></div> <!-- Extra space for tearing -->
        </div>
    `
}
