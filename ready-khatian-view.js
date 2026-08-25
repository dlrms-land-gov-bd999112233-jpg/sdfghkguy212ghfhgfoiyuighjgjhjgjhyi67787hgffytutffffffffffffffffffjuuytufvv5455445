(function(){
 const cfg=window.APP_CONFIG||{};const params=new URLSearchParams(location.search);const id=params.get('id');
 const page=document.getElementById('page'),nf=document.getElementById('notfound');
 function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v??''}
 function missing(){nf.hidden=false;page.hidden=true}
 if(!id||!/^[0-9]+$/.test(id)||!cfg.SUPABASE_URL||cfg.SUPABASE_URL.includes('PASTE_')||!cfg.SUPABASE_ANON_KEY){return missing()}
 const client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 (async()=>{const {data,error}=await client.from('ready_khatian').select('*').eq('id',Number(id)).maybeSingle();if(error||!data||data.is_deleted)return missing();page.hidden=false;nf.hidden=true;
  ['title','page_no','division','district','upazila','mouza','jl_no','record_no','owner_address','share','revenue','dag','agri','non_agri','dag_unit','dag_percent','record_share','area_unit','area_percent','remarks','note1','note2','note3','total_unit','total_percent','print_date','form_no'].forEach(k=>set('v_'+k,data[k]));
  const url=location.href; new QRCode(document.getElementById('qr'),{text:url,width:180,height:180,correctLevel:QRCode.CorrectLevel.M});
 })().catch(missing)
})();
