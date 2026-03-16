document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const navList = document.querySelector('.nav-list');


    if (burger && navList) {
        burger.addEventListener('click', function() {
            navList.classList.toggle('show');
        });

        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('show');
            });
        });

        document.addEventListener('click', function(event) {
            if (!burger.contains(event.target) && !navList.contains(event.target)) {
                navList.classList.remove('show');
            }
        });
    }
});