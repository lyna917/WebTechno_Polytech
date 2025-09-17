document.addEventListener('DOMContentLoaded', function() {
    createFilters();
    const sortedServices = services.sort((a, b) => a.name.localeCompare(b.name));
    const servicesContainer = document.getElementById('services-container');
    
    sortedServices.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesContainer.appendChild(serviceCard);
    });
    
    document.getElementById('customer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Заказ успешно оформлен! С вами свяжутся для подтверждения.');
        this.reset();
        resetOrder();
    });
});

function createServiceCard(service) {
    const serviceCard = document.createElement('div');
    serviceCard.className = 'service-card';
    serviceCard.dataset.service = service.keyword;
    serviceCard.dataset.category = service.category;
    serviceCard.dataset.kind = service.kind;
    
    serviceCard.innerHTML = `
        <div class="service-image">
            ${service.image}
        </div>
        <div class="service-info">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p class="price">${service.price}Р</p>
            <button class="add-to-order">Добавить</button>
        </div>
    `;
    
    serviceCard.querySelector('.add-to-order').addEventListener('click', function() {
        addToOrder(service.keyword);
    });
    
    return serviceCard;
}

function createFilters() {
    const categories = {
        'all': 'Все услуги',
        'clothing': 'Одежда',
        'accessories': 'Аксессуары',
        'headwear': 'Головные уборы',
        'premium': 'Премиум',
        'polygraphy': 'Полиграфия',
        'souvenirs': 'Сувениры'
    };
    
    const servicesSection = document.getElementById('services');
    const mainFilterContainer = document.createElement('div');
    mainFilterContainer.className = 'main-filters-container';
    
    const mainFilterTitle = document.createElement('h3');
    mainFilterTitle.textContent = 'Категории услуг:';
    mainFilterContainer.appendChild(mainFilterTitle);
    
    const mainFilters = document.createElement('div');
    mainFilters.className = 'main-filters';
    
    const allCategoriesButton = document.createElement('button');
    allCategoriesButton.className = 'main-filter-btn active';
    allCategoriesButton.dataset.category = 'all';
    allCategoriesButton.textContent = 'Все услуги';
    allCategoriesButton.addEventListener('click', filterByCategory);
    mainFilters.appendChild(allCategoriesButton);
    
    for (const category in categories) {
        if (category !== 'all') {
            const categoryButton = document.createElement('button');
            categoryButton.className = 'main-filter-btn';
            categoryButton.dataset.category = category;
            categoryButton.textContent = categories[category];
            categoryButton.addEventListener('click', filterByCategory);
            mainFilters.appendChild(categoryButton);
        }
    }
    
    mainFilterContainer.appendChild(mainFilters);
    servicesSection.insertBefore(mainFilterContainer, document.getElementById('services-container'));
    
    const subFiltersContainer = document.createElement('div');
    subFiltersContainer.className = 'subfilters-container';
    subFiltersContainer.id = 'subfilters-container';
    subFiltersContainer.style.display = 'none';
    servicesSection.insertBefore(subFiltersContainer, document.getElementById('services-container'));
}

function filterByCategory() {
    const category = this.dataset.category;
    
    document.querySelectorAll('.main-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    this.classList.add('active');
    
    document.querySelectorAll('.service-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    const subFiltersContainer = document.getElementById('subfilters-container');
    if (category !== 'all') {
        createSubFilters(category);
        subFiltersContainer.style.display = 'block';
    } else {
        subFiltersContainer.style.display = 'none';
    }
}

function createSubFilters(category) {
    const kindFilters = {
        'clothing': ['all', 'basic', 'premium'],
        'accessories': ['all', 'basic', 'premium'],
        'headwear': ['all', 'basic', 'premium'],
        'premium': ['all', 'exclusive', 'custom', 'luxury'],
        'polygraphy': ['all', 'paper', 'large_format', 'vinyl'],
        'souvenirs': ['all', 'metal', 'magnetic', 'cork', 'cardboard', 'plastic', 'leather']
    };
    
    const kindNames = {
        'all': 'Все',
        'basic': 'Базовый',
        'premium': 'Премиум',
        'exclusive': 'Эксклюзив',
        'custom': 'Индивидуальный',
        'luxury': 'Люкс',
        'paper': 'Бумага',
        'large_format': 'Крупный формат',
        'vinyl': 'Винил',
        'metal': 'Металл',
        'magnetic': 'Магнитный',
        'cork': 'Пробка',
        'cardboard': 'Картон',
        'plastic': 'Пластик',
        'leather': 'Кожа'
    };
    
    const subFiltersContainer = document.getElementById('subfilters-container');
    subFiltersContainer.innerHTML = '';
    
    const subFilterTitle = document.createElement('h4');
    subFilterTitle.textContent = 'Тип:';
    subFiltersContainer.appendChild(subFilterTitle);
    
    const subFilters = document.createElement('div');
    subFilters.className = 'sub-filters';
    
    if (kindFilters[category]) {
        kindFilters[category].forEach(kind => {
            const kindButton = document.createElement('button');
            kindButton.className = 'sub-filter-btn';
            kindButton.dataset.kind = kind;
            kindButton.dataset.category = category;
            kindButton.textContent = kindNames[kind] || kind;
            kindButton.addEventListener('click', filterByKind);
            subFilters.appendChild(kindButton);
        });
    }
    
    subFiltersContainer.appendChild(subFilters);
    subFilters.querySelector('.sub-filter-btn[data-kind="all"]').classList.add('active');
}

function filterByKind() {
    const kind = this.dataset.kind;
    const category = this.dataset.category;
    
    document.querySelectorAll(`.sub-filter-btn[data-category="${category}"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    this.classList.add('active');
    
    document.querySelectorAll(`.service-card[data-category="${category}"]`).forEach(card => {
        if (kind === 'all' || card.dataset.kind === kind) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

let selectedServices = {
    clothing: null,
    accessories: null,
    headwear: null,
    premium: null,
    polygraphy: null,
    souvenirs: null
};

function addToOrder(serviceKeyword) {
    const service = services.find(s => s.keyword === serviceKeyword);
    
    if (!service) return;
    
    const categoryCards = document.querySelectorAll(`.service-card[data-category="${service.category}"]`);
    categoryCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.service-card[data-service="${serviceKeyword}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    selectedServices[service.category] = service;
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    let total = 0;
    let hasSelection = false;
    
    for (const category in selectedServices) {
        if (selectedServices[category]) {
            hasSelection = true;
            break;
        }
    }
    
    if (!hasSelection) {
        orderContainer.innerHTML = '<p>Ничего не выбрано</p>';
        orderTotal.style.display = 'none';
        return;
    }
    
    let orderHTML = '';
    
    for (const category in selectedServices) {
        const service = selectedServices[category];
        if (service) {
            orderHTML += `
                <div class="order-category">
                    <h4>${getCategoryName(category)}</h4>
                    <div class="order-item">
                        <span>${service.name} ${service.price}Р</span>
                        <button class="remove-item" data-category="${category}">✕</button>
                    </div>
                </div>
            `;
            total += service.price;
        }
    }
    
    orderContainer.innerHTML = orderHTML;
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            removeFromOrder(category);
        });
    });
    
    document.getElementById('total-price').textContent = `${total}Р`;
    orderTotal.style.display = 'block';
}

function getCategoryName(category) {
    const categoryNames = {
        clothing: 'Одежда',
        accessories: 'Аксессуары',
        headwear: 'Головные уборы',
        premium: 'Премиум',
        polygraphy: 'Полиграфия',
        souvenirs: 'Сувениры'
    };
    
    return categoryNames[category] || category;
}

function removeFromOrder(category) {
    selectedServices[category] = null;
    
    document.querySelectorAll(`.service-card[data-category="${category}"]`).forEach(card => {
        card.classList.remove('selected');
    });
    
    updateOrderDisplay();
}

function resetOrder() {
    for (const category in selectedServices) {
        selectedServices[category] = null;
    }
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    updateOrderDisplay();
}