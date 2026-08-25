(function(){
 const cfg=window.APP_CONFIG||{}; const valid=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes('PASTE_')&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes('PASTE_');
 const fields=['title','division','district','upazila','mouza','jl_no','record_no','owner_address','share','revenue','dag','agri','non_agri','dag_unit','dag_percent','record_share','area_unit','area_percent','remarks','note1','note2','note3','total_unit','total_percent','print_date','form_no','page_no'];
 function msg(t,ok){const e=document.getElementById('msg');e.textContent=t;e.className='msg '+(ok?'ok':'err')}
 if(!valid||!window.supabase){msg('config.js-এ নতুন Supabase তথ্য বসান।',false);return}
 const client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 document.getElementById('save').onclick=async()=>{const row={};for(const f of fields){row[f]=document.getElementById(f).value.trim()}if(!row.title)return msg('সম্পূর্ণ শিরোনাম লিখুন।',false);const {data,error}=await client.from('ready_khatian').insert(row).select().single();if(error)return msg(error.message,false);const url=location.origin+location.pathname.replace('ready-khatian.html','ready-khatian-view.html')+'?id='+data.id;msg('✅ রেডি খতিয়ান তৈরি হয়েছে। নতুন লিংক: '+url,true);window.open(url,'_blank','noopener')}
})();
