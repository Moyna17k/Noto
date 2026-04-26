const btns = document.querySelectorAll('.noto-nav-btn');
const pages = document.querySelectorAll('.noto-page');

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.page;

        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === 'page-' + target) {
                p.classList.add('active');
                p.classList.remove('page-enter');
                void p.offsetWidth;
                p.classList.add('page-enter');
            }
        });
    });
});