document.addEventListener('DOMContentLoaded', function() {
    createFilters();
    const sortedServices = services.sort((a, b) => a.name.localeCompare(b.name));
    const servicesContainer = document.getElementById('services-container');
    
    sortedServices.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesContainer.appendChild(serviceCard);
    });
    
    document.querySelectorAll('.combo-add-btn').forEach(button => {
        button.addEventListener('click', function() {
            const comboType = this.dataset.combo;
            addComboToOrder(comboType);
        });
    });
    
    document.getElementById('customer-form').addEventListener('submit', function(e) {
        if (!validateComboSelection()) {
            e.preventDefault();
            return false;
        }
        alert('Заказ успешно оформлен! С вами свяжутся для подтверждения.');
        this.reset();
        resetOrder();
    });
    
    document.getElementById('notification-ok').addEventListener('click', function() {
        document.getElementById('notification').classList.add('hidden');
    });
});

// Изменяем структуру selectedServices на массив
let selectedServices = [];

function addComboToOrder(comboType) {
    const comboDefinitions = {
        'basic': ['tshirt_print', 'mug_print'],
        'business': ['business_cards', 'flyers', 'pen_print'],
        'premium': ['branded_merch', 'limited_edition', 'premium_packaging']
    };
    
    const selectedCombo = comboDefinitions[comboType];
    
    if (selectedCombo) {
        // Проверяем, не добавлены ли уже услуги из этого комбо
        const currentKeywords = selectedServices.map(service => service.keyword);
        
        const alreadyAdded = selectedCombo.some(keyword => currentKeywords.includes(keyword));
        
        if (alreadyAdded) {
            showNotification('Некоторые услуги из этого набора уже есть в заказе. Пожалуйста, очистите корзину перед добавлением нового комбо.', 'warning');
            return;
        }
        
        // Добавляем все услуги комбо
        selectedCombo.forEach(serviceKeyword => {
            addToOrder(serviceKeyword);
        });
        
        showNotification(`Комбо-набор "${getComboName(comboType)}" добавлен в заказ!`, 'success');
    }
}

function getComboName(comboType) {
    const comboNames = {
        'basic': 'Базовый набор',
        'business': 'Бизнес набор', 
        'premium': 'Премиум набор'
    };
    return comboNames[comboType] || comboType;
}

function validateComboSelection() {
    if (selectedServices.length === 0) {
        showNotification('Пожалуйста, выберите хотя бы одну услугу для оформления заказа.', 'error');
        return false;
    }
    
    const comboDefinitions = {
        'basic': ['tshirt_print', 'mug_print'],
        'business': ['business_cards', 'flyers', 'pen_print'],
        'premium': ['branded_merch', 'limited_edition', 'premium_packaging']
    };
    
    const selectedKeywords = selectedServices.map(service => service.keyword);
    
    let isValidCombo = false;
    let matchedCombo = '';
    
    // Проверяем, соответствует ли заказ одному из комбо-наборов
    for (const [comboName, requiredKeywords] of Object.entries(comboDefinitions)) {
        const hasAllRequired = requiredKeywords.every(keyword => selectedKeywords.includes(keyword));
        const hasOnlyRequired = selectedKeywords.every(keyword => requiredKeywords.includes(keyword));
        
        if (hasAllRequired && hasOnlyRequired) {
            isValidCombo = true;
            matchedCombo = comboName;
            break;
        }
    }
    
    // Если заказ не соответствует ни одному комбо, проверяем частичные совпадения
    if (!isValidCombo) {
        let bestMatch = null;
        let bestMatchMissing = [];
        
        for (const [comboName, requiredKeywords] of Object.entries(comboDefinitions)) {
            const missing = requiredKeywords.filter(keyword => !selectedKeywords.includes(keyword));
            const extra = selectedKeywords.filter(keyword => !requiredKeywords.includes(keyword));
            
            // Ищем наиболее подходящий комбо (с наименьшим количеством недостающих услуг)
            if (bestMatch === null || missing.length < bestMatchMissing.length) {
                bestMatch = comboName;
                bestMatchMissing = missing;
            }
        }
        
        if (bestMatchMissing.length > 0) {
            const missingItems = bestMatchMissing.map(keyword => {
                const service = services.find(s => s.keyword === keyword);
                return service ? service.name : keyword;
            });
            
            const message = `Для завершения набора "${getComboName(bestMatch)}" добавьте: ${missingItems.join(', ')}`;
            showNotification(message, 'warning');
            return false;
        }
    }
    
    if (!isValidCombo) {
        showNotification('Выбранные услуги не образуют полный набор. Пожалуйста, выберите один из готовых комбо-наборов.', 'error');
        return false;
    }
    
    return true;
}

function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationTitle = document.querySelector('.notification-title');
    
    notification.className = `notification ${type}`;
    
    switch(type) {
        case 'success':
            notificationIcon.textContent = '✅';
            notificationTitle.textContent = 'Успешно!';
            break;
        case 'warning':
            notificationIcon.textContent = '⚠️';
            notificationTitle.textContent = 'Внимание';
            break;
        case 'error':
            notificationIcon.textContent = '❌';
            notificationTitle.textContent = 'Ошибка';
            break;
        default:
            notificationIcon.textContent = 'ℹ️';
            notificationTitle.textContent = 'Информация';
    }
    
    notificationMessage.textContent = message;
    notification.classList.remove('hidden');
}

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

function addToOrder(serviceKeyword) {
    const service = services.find(s => s.keyword === serviceKeyword);
    
    if (!service) return;
    
    // Проверяем, не добавлена ли уже эта услуга
    const alreadyAdded = selectedServices.some(s => s.keyword === serviceKeyword);
    if (alreadyAdded) {
        showNotification('Эта услуга уже добавлена в заказ.', 'warning');
        return;
    }
    
    // Добавляем услугу в массив
    selectedServices.push(service);
    
    // Выделяем карточку
    const selectedCard = document.querySelector(`.service-card[data-service="${serviceKeyword}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    let total = 0;
    
    if (selectedServices.length === 0) {
        orderContainer.innerHTML = '<p>Ничего не выбрано</p>';
        orderTotal.style.display = 'none';
        return;
    }
    
    let orderHTML = '';
    
    // Группируем услуги по категориям для отображения
    const servicesByCategory = {};
    selectedServices.forEach(service => {
        if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
        }
        servicesByCategory[service.category].push(service);
    });
    
    for (const category in servicesByCategory) {
        orderHTML += `
            <div class="order-category">
                <h4>${getCategoryName(category)}</h4>
        `;
        
        servicesByCategory[category].forEach(service => {
            orderHTML += `
                <div class="order-item">
                    <span>${service.name} ${service.price}Р</span>
                    <button class="remove-item" data-service="${service.keyword}">✕</button>
                </div>
            `;
            total += service.price;
        });
        
        orderHTML += `</div>`;
    }
    
    orderContainer.innerHTML = orderHTML;
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const serviceKeyword = this.dataset.service;
            removeFromOrder(serviceKeyword);
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

function removeFromOrder(serviceKeyword) {
    // Удаляем услугу из массива
    selectedServices = selectedServices.filter(service => service.keyword !== serviceKeyword);
    
    // Снимаем выделение с карточки
    const selectedCard = document.querySelector(`.service-card[data-service="${serviceKeyword}"]`);
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
    
    updateOrderDisplay();
}

function resetOrder() {
    selectedServices = [];
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    updateOrderDisplay();
}