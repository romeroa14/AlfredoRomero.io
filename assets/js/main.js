(function(){
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=new Date().getFullYear();}

  function updateHeaderHeight(){
    const header=document.querySelector('.header');
    if(!header) return;
    const h=header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-h', h+ 'px');
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, {passive:true});

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      const el=document.querySelector(id);
      if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}    
    });
  });
})();
