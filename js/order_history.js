// Основной файл для работы со страницей заказов
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка заказов при открытии страницы
    loadOrders();
    
    // Инициализация обработчиков событий
    initEventHandlers();
});

// API URL
const API_BASE_URL = 'https://api-3imo.onrender.com';

// Текущий редактируемый/удаляемый заказ
let currentOrderId = null;

// Загрузка списка заказов
async function loadOrders() {
    try {
        showLoading();
        const orders = await fetchOrders();
        displayOrders(orders);
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        showNotification('Не удалось загрузить заказы', 'error');
    }
}

// Запрос к API для получения заказов
async function fetchOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
        throw new Error('Ошибка сети');
    }
    return await response.json();
}

// Отображение списка заказов в таблице
function displayOrders(orders) {
    const tbody = document.getElementById('orders-tbody');
    const noOrders = document.getElementById('no-orders');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Нет заказов</td></tr>';
        noOrders.classList.remove('hidden');
        return;
    }
    
    noOrders.classList.add('hidden');
    
    // Сортируем заказы по дате (новые сначала)
    orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    
    const ordersHTML = orders.map(order => createOrderRow(order)).join('');
    tbody.innerHTML = ordersHTML;
    
    // Добавляем обработчики для кнопок действий
    addOrderActionHandlers();
}

// Создание строки таблицы для заказа
function createOrderRow(order) {
    const orderDate = new Date(order.order_date).toLocaleString('ru-RU');
    const deliveryTime = order.delivery_time === 'asap' 
        ? 'Как можно скорее (с 7:00 до 23:00)' 
        : order.delivery_time;

    return `
        <tr data-order-id="${order.id}">
            <td>${order.id}</td>
            <td>${orderDate}</td>
            <td>${order.service_names || 'Услуги не указаны'}</td>
            <td>${order.total_price}</td>
            <td>${deliveryTime}</td>
            <td>
                <div class="order-actions">
                    <button class="action-btn details-btn" title="Подробнее" data-order-id="${order.id}">
                        <i class="bi bi-info-circle"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Редактировать" data-order-id="${order.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Удалить" data-order-id="${order.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Инициализация обработчиков событий
function initEventHandlers() {
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Кнопки в модальных окнах
    document.getElementById('close-details-btn').addEventListener('click', closeAllModals);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeAllModals);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeAllModals);
    
    // Сохранение изменений
    document.getElementById('save-order-btn').addEventListener('click', saveOrderChanges);
    
    // Подтверждение удаления
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDeleteOrder);
    
    // Закрытие уведомления
    document.getElementById('notification-close').addEventListener('click', () => {
        document.getElementById('notification').classList.add('hidden');
    });
    
    // Закрытие по клику вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Добавление обработчиков для кнопок действий в таблице
function addOrderActionHandlers() {
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            showOrderDetails(orderId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            showEditOrderForm(orderId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            showDeleteConfirmation(orderId);
        });
    });
}

// Показать детали заказа
async function showOrderDetails(orderId) {
    try {
        const order = await fetchOrderById(orderId);
        displayOrderDetails(order);
        document.getElementById('details-order-id').textContent = orderId;
        document.getElementById('order-details-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка загрузки деталей заказа:', error);
        showNotification('Не удалось загрузить детали заказа', 'error');
    }
}

// Запрос к API для получения конкретного заказа
async function fetchOrderById(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!response.ok) {
        throw new Error('Ошибка сети');
    }
    return await response.json();
}

// Получить услуги заказа
async function fetchOrderServices(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/services`);
    if (!response.ok) {
        throw new Error('Ошибка сети');
    }
    return await response.json();
}

// Отображение деталей заказа
async function displayOrderDetails(order) {
    const content = document.getElementById('order-details-content');
    
    console.log('Полные данные заказа:', order); // Для отладки
    
    // Форматируем дату
    const orderDate = order.order_date ? new Date(order.order_date).toLocaleString('ru-RU') : 'Не указана';
    
    // Форматируем время доставки
    const deliveryTime = order.delivery_time === 'asap' 
        ? 'Как можно скорее (с 7:00 до 23:00)' 
        : (order.delivery_time || 'Не указано');
    
    // Создаем HTML для отображения
    let html = `
        <div class="order-info-section">
            <h4>Основная информация о заказе #${order.id}</h4>
            <div class="order-info-grid">
    `;
    
    // Добавляем все поля заказа
    const fields = [
        { key: 'order_date', label: 'Дата оформления', value: orderDate },
        { key: 'status', label: 'Статус', value: order.status || 'Не указан' },
        { key: 'total_price', label: 'Общая стоимость', value: order.total_price || 'Не указана' },
        { key: 'total_services', label: 'Количество услуг', value: order.total_services || '0' },
        { key: 'customer_name', label: 'Имя клиента', value: order.customer_name || 'Не указано' },
        { key: 'customer_email', label: 'Email', value: order.customer_email || 'Не указан' },
        { key: 'customer_phone', label: 'Телефон', value: order.customer_phone || 'Не указан' },
        { key: 'customer_address', label: 'Адрес', value: order.customer_address || 'Не указан' },
        { key: 'delivery_time', label: 'Время доставки', value: deliveryTime },
        { key: 'comments', label: 'Комментарий', value: order.comments || 'Нет комментария' },
        { key: 'service_names', label: 'Услуги', value: order.service_names || 'Не указаны' }
    ];
    
    fields.forEach(field => {
        html += `
            <div class="order-info-item">
                <strong>${field.label}:</strong> ${field.value}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    // Пробуем получить детальную информацию об услугах
    try {
        const services = await fetchOrderServices(order.id);
        if (services && services.length > 0) {
            html += `
                <div class="order-info-section">
                    <h4>Детали услуг</h4>
                    <div class="service-list">
            `;
            
            services.forEach(service => {
                html += `
                    <div class="service-item">
                        <strong>${service.service_name || 'Без названия'}</strong>
                        <div class="service-details">
                            <small>Цена: ${service.service_price || 'Не указана'}</small>
                            ${service.service_description ? `<br><small>Описание: ${service.service_description}</small>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.log('Не удалось загрузить детали услуг:', error);
    }
    
    // Показываем сырые данные для отладки
    html += `
        <div class="order-info-section">
            <h4>Отладочная информация</h4>
            <details>
                <summary>Показать полные данные заказа (JSON)</summary>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px; font-size: 12px;">${JSON.stringify(order, null, 2)}</pre>
            </details>
        </div>
    `;
    
    content.innerHTML = html;
}

// Показать форму редактирования заказа
async function showEditOrderForm(orderId) {
    try {
        const order = await fetchOrderById(orderId);
        currentOrderId = orderId;
        populateEditForm(order);
        document.getElementById('edit-modal-order-id').textContent = orderId;
        document.getElementById('order-edit-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка загрузки заказа для редактирования:', error);
        showNotification('Не удалось загрузить данные заказа', 'error');
    }
}

// Заполнение формы редактирования
function populateEditForm(order) {
    document.getElementById('edit-order-id').value = order.id;
    document.getElementById('edit-customer-name').value = order.customer_name || '';
    document.getElementById('edit-customer-email').value = order.customer_email || '';
    document.getElementById('edit-customer-phone').value = order.customer_phone || '';
    document.getElementById('edit-customer-address').value = order.customer_address || '';
    document.getElementById('edit-delivery-time').value = order.delivery_time || '';
    document.getElementById('edit-comments').value = order.comments || '';
}

// Сохранение изменений заказа
async function saveOrderChanges() {
    const orderId = document.getElementById('edit-order-id').value;
    
    try {
        // Получаем полные данные заказа для обновления
        const order = await fetchOrderById(orderId);
        
        const formData = {
            name: document.getElementById('edit-customer-name').value,
            email: document.getElementById('edit-customer-email').value,
            phone: document.getElementById('edit-customer-phone').value,
            address: document.getElementById('edit-customer-address').value,
            delivery_time: document.getElementById('edit-delivery-time').value,
            comments: document.getElementById('edit-comments').value,
            total_services: order.total_services,
            total_price: order.total_price
        };
        
        // Добавляем информацию об услугах из исходного заказа
        if (order.order_details && typeof order.order_details === 'object') {
            for (let i = 0; i < order.total_services; i++) {
                const servicePrefix = `service_${i}_`;
                formData[`${servicePrefix}id`] = order.order_details[`${servicePrefix}id`];
                formData[`${servicePrefix}name`] = order.order_details[`${servicePrefix}name`];
                formData[`${servicePrefix}price`] = order.order_details[`${servicePrefix}price`];
                formData[`${servicePrefix}description`] = order.order_details[`${servicePrefix}description`] || '';
            }
        }
        
        await updateOrder(orderId, formData);
        showNotification('Заказ успешно изменён', 'success');
        closeAllModals();
        loadOrders(); // Обновляем список заказов
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showNotification('Не удалось сохранить изменения', 'error');
    }
}

// Обновление заказа через API
async function updateOrder(orderId, data) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сети: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
}

// Показать подтверждение удаления
async function showDeleteConfirmation(orderId) {
    try {
        const order = await fetchOrderById(orderId);
        currentOrderId = orderId;
        
        const deleteInfo = document.getElementById('delete-order-info');
        deleteInfo.innerHTML = `
            <strong>Заказ #${order.id}</strong><br>
            <strong>Клиент:</strong> ${order.customer_name || 'Не указан'}<br>
            <strong>Услуги:</strong> ${order.service_names || 'Не указаны'}<br>
            <strong>Стоимость:</strong> ${order.total_price || 'Не указана'}
        `;
        
        document.getElementById('delete-modal-order-id').textContent = orderId;
        document.getElementById('order-delete-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка загрузки заказа для удаления:', error);
        showNotification('Не удалось загрузить данные заказа', 'error');
    }
}

// Подтверждение удаления заказа
async function confirmDeleteOrder() {
    if (!currentOrderId) return;
    
    try {
        await deleteOrder(currentOrderId);
        showNotification('Заказ успешно удалён', 'success');
        closeAllModals();
        loadOrders(); // Обновляем список заказов
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        showNotification('Не удалось удалить заказ', 'error');
    }
}

// Удаление заказа через API
async function deleteOrder(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сети: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
}

// Закрытие всех модальных окон
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    currentOrderId = null;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    notification.className = `notification ${type}`;
    messageElement.textContent = message;
    notification.classList.remove('hidden');
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Показать индикатор загрузки
function showLoading() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка заказов...</td></tr>';
}