import{rr as e}from"./_plugin-vue_export-helper-_HKR-Qw9.js";var t,n,r,i,a,o=e((()=>{t=(e,t,n)=>(e||={},`
        <div class="print-nota nota-wrapper">
            <!-- Header -->
            <div class="nota-header">
                <div class="nota-header-left">
                    ${n?`<img src="${n}" alt="Logo" class="nota-logo" />`:``}
                    <div class="nota-biz-info">
                        <h2 class="nota-biz-name">${e.business_name||`NUNOX SERVIS`}</h2>
                        <div class="nota-biz-addr">📍 ${e.address||``}</div>
                        <div class="nota-biz-phone">📞 ${e.whatsapp||e.phone||``}</div>
                    </div>
                </div>
                <div class="nota-header-right">
                    <h1 class="nota-title">TANDA TERIMA</h1>
                    <div class="nota-no"><strong>No:</strong> ${t?t.ticket_number:`...................................`}</div>
                    <div class="nota-date">Tanggal: ${t?new Date(t.created_at+`Z`).toLocaleDateString(`id-ID`):`...................................`}</div>
                </div>
            </div>
            
            <!-- Body: 3 Columns -->
            <div class="nota-body">
                <!-- Pelanggan -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Pelanggan</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Nama</td><td>: <strong>${t?t.customer_name:`............................`}</strong></td></tr>
                        <tr><td class="nota-label">No. HP</td><td>: ${t?t.customer_phone||`-`:`............................`}</td></tr>
                        <tr><td class="nota-label">Alamat</td><td>: ${t?t.customer_address||`-`:`............................`}</td></tr>
                    </table>
                </div>
                
                <!-- Perangkat -->
                <div class="nota-col">
                    <h4 class="nota-col-title">Data Perangkat</h4>
                    <table class="nota-table">
                        <tr><td class="nota-label">Jenis</td><td>: <strong>${t?t.device_type:`............................`}</strong></td></tr>
                        <tr><td class="nota-label">Merk/Tipe</td><td>: ${t?(t.brand||``)+` `+(t.model||``):`............................`}</td></tr>
                        <tr><td class="nota-label">SN</td><td>: ${t?t.serial_number||`-`:`............................`}</td></tr>
                    </table>
                </div>
                
                <!-- Keluhan -->
                <div class="nota-col" style="flex: 1.5;">
                    <h4 class="nota-col-title">Keluhan / Kerusakan</h4>
                    <div class="nota-complaint" style="white-space: pre-wrap;">${t?(()=>{let e=``,n=t.customer_complaint||``,r=n.indexOf(`\\n\\n[Kelengkapan & Kondisi Fisik]:\\n`);return r===-1?e+=n:(e+=n.substring(0,r),!t.accessories&&!t.physical_condition&&(e+=`<br/><br/><strong>Kelengkapan & Kondisi Fisik (Legacy):</strong><br/>`+n.substring(r+36))),t.accessories&&(e+=`<br/><br/><strong>Kelengkapan:</strong> `+t.accessories),t.physical_condition&&(e+=`<br/><br/><strong>Kondisi Fisik:</strong> `+t.physical_condition),e||`..................................................<br/>..................................................<br/>..................................................`})():`..................................................<br/>..................................................<br/>..................................................`}</div>
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
                    <div class="nota-sig-line">${e.business_name||`Toko`}</div>
                </div>
                
                <div class="nota-sig-box">
                    <div class="nota-sig-title">Pelanggan,</div>
                    <div class="nota-sig-line">${t?t.customer_name:`............................`}</div>
                </div>
            </div>
        </div>
    `),n=(e,t,n,r,i)=>{e||={};let a=e=>new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(Number(e||0)),o=``;n&&n.length>0?n.forEach(e=>{let t=e.description;e.item_type===`Sparepart`&&(t=e.part_name||t),o+=`
                <tr class="inv-tr">
                    <td class="inv-td-desc">
                        <div class="inv-item-title">${t}</div>
                        <div class="inv-item-sub">${e.item_type} &bull; Qty: ${e.quantity} &bull; ${a(e.price)}/item</div>
                    </td>
                    <td class="inv-td-amount">${a(e.total)}</td>
                </tr>
            `}):o=`<tr><td colspan="2" class="inv-empty">Belum ada rincian biaya.</td></tr>`;let s=0;r&&r.length>0&&(s=r.reduce((e,t)=>e+(t.amount||0),0));let c=(t.total_cost||0)-s;return`
        <div class="print-invoice invoice-box">
            <!-- Header Section -->
            <div class="inv-header">
                <div class="inv-header-left">
                    ${i?`<img src="${i}" alt="Logo" class="inv-logo" />`:`<div class="inv-logo-placeholder">${(e.business_name||`N`).charAt(0)}</div>`}
                    <div class="inv-biz-info">
                        <h2 class="inv-biz-name">${e.business_name||`NUNOX SERVIS`}</h2>
                        <div class="inv-biz-addr">📍 ${e.address||``}</div>
                        <div class="inv-biz-phone">${e.whatsapp||e.phone||``}</div>
                    </div>
                </div>
                <div class="inv-header-right">
                    <h1 class="inv-title">INVOICE</h1>
                    <div class="inv-meta-box">
                        <div class="inv-meta-label">No. Tiket</div>
                        <div class="inv-meta-value">${t.ticket_number}</div>
                        <div class="inv-meta-label inv-meta-label-mt">Tanggal</div>
                        <div class="inv-meta-value-sm">${new Date().toLocaleDateString(`id-ID`,{year:`numeric`,month:`long`,day:`numeric`})}</div>
                    </div>
                </div>
            </div>
            
            <!-- Customer & Device Info -->
            <div class="inv-info-row">
                <div class="inv-info-card">
                    <div class="inv-info-title">Tagihan Kepada</div>
                    <div class="inv-info-main">${t.customer_name}</div>
                    <div class="inv-info-sub">${t.customer_phone||`-`}</div>
                </div>
                <div class="inv-info-card">
                    <div class="inv-info-title">Informasi Perangkat</div>
                    <div class="inv-info-main">${t.device_type} ${t.brand||``}</div>
                    <div class="inv-info-sub">${t.model||`-`}</div>
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
                    ${o}
                </tbody>
            </table>
            
            <!-- Summary & Totals -->
            <div class="inv-summary-row">
                <div class="inv-notes-box">
                    <div class="inv-notes-title">Catatan Tambahan</div>
                    <div class="inv-notes-content">
                        ${e.receipt_footer||`Terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami. Garansi servis berlaku selama 30 hari sejak tanggal pengambilan.`}
                    </div>
                </div>
                <div class="inv-totals-box">
                    <table class="inv-totals-table">
                        <tr>
                            <td class="inv-tot-label">Total Biaya:</td>
                            <td class="inv-tot-val">${a(t.total_cost||0)}</td>
                        </tr>
                        <tr>
                            <td class="inv-tot-label">Telah Dibayar:</td>
                            <td class="inv-tot-val-paid">${a(s)}</td>
                        </tr>
                        <tr><td colspan="2"><hr class="inv-tot-hr"></td></tr>
                        <tr>
                            <td class="inv-bal-label">Sisa Tagihan:</td>
                            <td class="inv-bal-val ${c>0?`inv-bal-unpaid`:`inv-bal-paid`}">${a(Math.max(0,c))}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Signatures -->
            <div class="inv-signatures">
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Pelanggan</div>
                    <div class="nota-sig-line">${t.customer_name}</div>
                </div>
                <div class="inv-sig-col">
                    <div class="nota-sig-title">Hormat Kami</div>
                    <img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain; margin: 10px 0;" alt="Tanda Tangan" />
                    <div class="nota-sig-line">${e.business_name||`NUNOX`}</div>
                </div>
            </div>
        </div>
    `},r=(e,t,n,r,i,a,o,s,c=[])=>{e||={};let l=e=>new Intl.NumberFormat(`id-ID`,{style:`currency`,currency:`IDR`,minimumFractionDigits:0}).format(Number(e||0)),u=``;t&&t.length>0?t.forEach((e,t)=>{u+=`
                <tr>
                    <td class="rep-td-center">${t+1}</td>
                    <td class="rep-td">${e.ticket_number}</td>
                    <td class="rep-td">${new Date(e.completed_date+`Z`).toLocaleDateString(`id-ID`)}</td>
                    <td class="rep-td">${e.customer_name}</td>
                    <td class="rep-td">${e.brand||``} ${e.model||``}</td>
                    <td class="rep-td-right">${l(e.total_cost)}</td>
                </tr>
            `}):u=`<tr><td colspan="6" class="rep-td-center" style="padding: 15px;">Tidak ada transaksi</td></tr>`;let d=``;return d=c&&c.length>0?`
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h3 style="font-size: 14pt; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Peringkat 5 Sparepart Terlaris</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    ${c.map((e,t)=>`
                        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 15px; flex: 1; min-width: 120px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                            <div style="font-size: 9pt; color: #64748b; font-weight: 600; margin-bottom: 4px;">Peringkat #${t+1}</div>
                            <div style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 8px;">${e.part_name}</div>
                            <div style="font-size: 10pt; color: #10b981; font-weight: bold;">Terpakai: ${e.total_sold} unit</div>
                        </div>
                    `).join(``)}
                </div>
            </div>
        `:`
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h3 style="font-size: 14pt; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Peringkat 5 Sparepart Terlaris</h3>
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; color: #64748b; text-align: center;">Belum ada data penggunaan sparepart di periode ini.</div>
            </div>
        `,`
        <div class="print-report" style="max-width: 100%; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px;">
                ${s?`<img src="${s}" style="max-height: 70px; margin-bottom: 10px;" />`:``}
                <h1 style="margin: 0; font-size: 24pt; color: #1e293b; letter-spacing: 1px;">LAPORAN KEUANGAN BULANAN</h1>
                <h2 style="margin: 5px 0 10px 0; font-size: 16pt; color: #475569;">${e.business_name||`NUNOX SERVIS`}</h2>
                <div style="display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 11pt;">Periode: ${n} s/d ${r}</div>
            </div>
            
            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #4f46e5; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Omset (Kotor)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #1e293b;">${l(i)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #ef4444; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total HPP (Modal)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #ef4444;">${l(a)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #10b981; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Laba Bersih (Profit)</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #10b981;">${l(o)}</div>
                </div>
                <div style="flex: 1; background: #ffffff; border-left: 5px solid #f59e0b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 11pt; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Transaksi</div>
                    <div style="font-size: 20pt; font-weight: 800; color: #f59e0b;">${t.length} Unit</div>
                </div>
            </div>
            
            ${d}
            
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
                        ${u}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 50px; text-align: right; color: #64748b; font-size: 10pt;">
                <div>Dicetak pada: ${new Date().toLocaleString(`id-ID`)}</div>
                <div style="margin-top: 10px;"><img src="/img/tanda-tangan.png" style="height: 60px; object-fit: contain;" alt="Tanda Tangan" /></div>
                <div style="margin-top: 10px; font-weight: bold;">( ${e.business_name||`Pemilik`} )</div>
            </div>
        </div>
    `},i=async(e,t=!1,n=!1)=>{let r=document.getElementById(`print-area`);if(r){r.innerHTML=e;let i=r.querySelectorAll(`img`),a=Array.from(i).map(e=>e.complete?Promise.resolve():new Promise(t=>{e.onload=t,e.onerror=t}));await Promise.all(a),await new Promise(e=>setTimeout(e,50));let o=document.getElementById(`dynamic-print-style`);if(o||(o=document.createElement(`style`),o.id=`dynamic-print-style`,document.head.appendChild(o)),n?o.innerHTML=`@media print { @page { size: 58mm auto; margin: 0; } }`:o.innerHTML=t?`@media print { @page { size: A5 landscape; } }`:`@media print { @page { size: A4 portrait; } }`,window.api&&window.api.printPreview)try{let e={landscape:t&&!n};n||(e.pageSize=t?`A5`:`A4`),await window.api.printPreview(e)}catch(e){console.error(`Print preview error:`,e)}else window.print();r.innerHTML=``,o&&(o.innerHTML=``)}},a=async(e,t)=>window.api&&window.api.exportPdf?await window.api.exportPdf({html:e,filename:t}):{success:!1,error:`API exportPdf not found`}}));export{o as a,r as i,n,i as o,t as r,a as t};