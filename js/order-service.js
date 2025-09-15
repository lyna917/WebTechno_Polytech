// order-services.js
document.addEventListener('DOMContentLoaded', function() {
    // Сортируем услуги в алфавитном порядке
    const sortedServices = services.sort((a, b) => a.name.localeCompare(b.name));
    
    // Находим контейнер для услуг
    const servicesContainer = document.getElementById('services-container');
    
    // Создаем карточки для каждой услуги
    sortedServices.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.dataset.service = service.keyword;
        serviceCard.dataset.category = service.category;
        
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
        
        servicesContainer.appendChild(serviceCard);
    });
    
    // Добавляем обработчики событий для кнопок "Добавить"
    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceKeyword = serviceCard.dataset.service;
            addToOrder(serviceKeyword);
        });
    });
    
    // Обработчик отправки формы
    document.getElementById('customer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Заказ успешно оформлен! С вами свяжутся для подтверждения.');
        this.reset();
        resetOrder();
    });
});

let selectedServices = {
    clothing: null,
    accessories: null,
    headwear: null,
    premium: null
};

function addToOrder(serviceKeyword) {
    // Находим услугу по ключевому слову
    const service = services.find(s => s.keyword === serviceKeyword);
    
    if (!service) return;
    
    // Сбрасываем выделение всех карточек в этой категории
    const categoryCards = document.querySelectorAll(`.service-card[data-category="${service.category}"]`);
    categoryCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    document.querySelector(`.service-card[data-service="${serviceKeyword}"]`).classList.add('selected');
    
    // Сохраняем выбранную услугу
    selectedServices[service.category] = service;
    
    // Обновляем отображение заказа
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    let total = 0;
    let hasSelection = false;
    
    // Проверяем, есть ли выбранные услуги
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
    
    // Формируем список только выбранных услуг
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
    
    // Добавляем обработчики событий для кнопок удаления
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            removeFromOrder(category);
        });
    });
    
    // Обновляем итоговую стоимость
    document.getElementById('total-price').textContent = `${total}Р`;
    orderTotal.style.display = 'block';
}

function getCategoryName(category) {
    const categoryNames = {
        clothing: 'Одежда',
        accessories: 'Аксессуары',
        headwear: 'Головные уборы',
        premium: 'Премиум'
    };
    
    return categoryNames[category] || category;
}

function removeFromOrder(category) {
    selectedServices[category] = null;
    
    // Сбрасываем выделение карточек в этой категории
    document.querySelectorAll(`.service-card[data-category="${category}"]`).forEach(card => {
        card.classList.remove('selected');
    });
    
    // Обновляем отображение заказа
    updateOrderDisplay();
}

function resetOrder() {
    // Сбрасываем выбранные услуги
    for (const category in selectedServices) {
        selectedServices[category] = null;
    }
    
    // Сбрасываем выделение карточек
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Обновляем отображение заказа
    updateOrderDisplay();
}