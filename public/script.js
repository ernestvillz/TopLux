// Smooth scrolling
const scrollButtons = document.querySelectorAll('[data-scroll]');

scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const target = document.querySelector(button.dataset.scroll);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


// Vehicle collection
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.car-card');
const inventoryCount = document.querySelector('#inventoryCount');


// Open vehicle display when a car is clicked
cards.forEach((card) => {
    card.addEventListener('click', () => {
        openVehicle();
    });
});


// Vehicle filters
filters.forEach((filter) => {
    filter.addEventListener('click', () => {

        filters.forEach((item) => {
            item.classList.remove('active');
        });

        filter.classList.add('active');

        const selected = filter.dataset.filter;
        let visible = 0;

        cards.forEach((card) => {

            const show =
                selected === 'all' ||
                card.dataset.category === selected;

            card.style.display = show ? '' : 'none';

            if (show) {
                visible++;
            }
        });

        inventoryCount.textContent =
            `${String(visible).padStart(2, '0')} vehicles`;
    });
});


// Open vehicle detail
function openVehicle() {
    const vehicleDetail = document.querySelector('#vehicleDetail');

    if (vehicleDetail) {
        vehicleDetail.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}


// Close vehicle detail
function closeVehicle() {
    const vehicleDetail = document.querySelector('#vehicleDetail');

    if (vehicleDetail) {
        vehicleDetail.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// Contact form
const contactForm = document.querySelector('#contactForm');

if (contactForm) {

    contactForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');

        const formStatus = document.querySelector('#formStatus');

        if (formStatus) {
            formStatus.textContent =
                `Thank you, ${name}. Our concierge will be in touch shortly.`;
        }

        contactForm.reset();
    });
}