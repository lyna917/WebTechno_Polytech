// Замените объявление servicesData и инициализацию на:
let servicesData = [];

// Изменяем структуру selectedServices на массив
let selectedServices = [];

// Функция для загрузки корзины из localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            selectedServices = parsedCart;
            console.log('Корзина загружена из localStorage:', selectedServices);
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины из localStorage:', error);
        selectedServices = [];
    }
}

// Функция для сохранения корзины в localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('shoppingCart', JSON.stringify(selectedServices));
        console.log('Корзина сохранена в localStorage:', selectedServices);
    } catch (error) {
        console.error('Ошибка сохранения корзины в localStorage:', error);
    }
}

// Функция для очистки корзины в localStorage
function clearCartFromStorage() {
    try {
        localStorage.removeItem('shoppingCart');
        console.log('Корзина очищена из localStorage');
    } catch (error) {
        console.error('Ошибка очистки корзины из localStorage:', error);
    }
}

// Если хотите использовать чистый JSON
async function loadServicesData() {
    try {
        const response = await fetch('https://api-3imo.onrender.com/');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        
        servicesData = await response.json();
        
        // Добавляем эмодзи к загруженным данным, если их нет
        servicesData.forEach(section => {
            if (section.services) {
                section.services.forEach(service => {
                    if (service && !service.image) {
                        service.image = getServiceEmoji(service);
                    }
                });
            }
        });
        
        console.log('Данные успешно загружены:', servicesData);
        return true;
    } catch (error) {
        console.error('Ошибка загрузки данных услуг:', error);
        servicesData = getFallbackData();
        return false;
    }
}

// Fallback данные на случай ошибки
function getFallbackData() {
    return [
        {
            section: "delivery",
            title: "Доставка",
            services: [
                {
                    id: "delivery",
                    name: "УПР доставка",
                    description: "Персональная доставка с примеркой",
                    price: "1000 ₽",
                    image: "🚚"
                }
            ]
        },
        {
            section: "accessories",
            title: "Аксессуары",
            services: [
                {
                    id: "labels",
                    name: "Этикетки",
                    description: "Качественные этикетки для продукции",
                    price: "150 ₽",
                    image: "🏷️"
                },
                {
                    id: "clock",
                    name: "Часы с принтом",
                    description: "Настенные часы с индивидуальным дизайном",
                    price: "900 ₽",
                    image: "⏰"
                }
            ]
        },
        {
            section: "clothing",
            title: "Печать на одежде",
            services: [
                {
                    id: "tshirt_print",
                    name: "Печать на футболках",
                    description: "Качественная печать на футболках различных размеров",
                    price: "от 500 ₽",
                    image: "👕"
                }
            ]
        }
    ];
}

// Функция для получения эмодзи для услуги
function getServiceEmoji(service) {
    const emojiMap = {
        'delivery': '🚚',
        'labels': '🏷️',
        'clock': '⏰',
        'tshirt_print': '👕',
        'mug_print': '☕',
        'business_cards': '📇',
        'flyers': '📄',
        'pen_print': '✏️',
        'branded_merch': '🎁',
        'limited_edition': '⭐',
        'premium_packaging': '🎀'
    };
    
    // Сопоставляем по ID услуги или названию
    if (service.id && emojiMap[service.id]) {
        return emojiMap[service.id];
    }
    
    // Ищем по ключевым словам в названии
    const name = service.name ? service.name.toLowerCase() : '';
    if (name.includes('доставк')) return '🚚';
    if (name.includes('этикетк') || name.includes('бирк')) return '🏷️';
    if (name.includes('час')) return '⏰';
    if (name.includes('футболк') || name.includes('одежд')) return '👕';
    if (name.includes('кружк') || name.includes('муг')) return '☕';
    if (name.includes('визитк')) return '📇';
    if (name.includes('листовк') || name.includes('флаер')) return '📄';
    if (name.includes('ручк')) return '✏️';
    if (name.includes('сувенир') || name.includes('мерч')) return '🎁';
    if (name.includes('премиум') || name.includes('эксклюзив')) return '⭐';
    if (name.includes('упаковк')) return '🎀';
    
    // Эмодзи по категории
    const categoryEmoji = {
        'clothing': '👕',
        'accessories': '👜',
        'headwear': '🧢',
        'premium': '⭐',
        'polygraphy': '📄',
        'souvenirs': '🎁',
        'delivery': '🚚'
    };
    
    return categoryEmoji[service.section] || '📦';
}

// Функция для показа индикатора загрузки
function showLoadingIndicator() {
    const servicesContainer = document.getElementById('services-container');
    servicesContainer.innerHTML = `
        <div class="loading" style="text-align: center; padding: 50px;">
            <div style="font-size: 18px; color: rgb(0,0,55);">Загрузка услуг...</div>
            <div style="margin-top: 20px;">⏳</div>
        </div>
    `;
}

// Функция для показа сообщения об ошибке
function showErrorMessage() {
    const servicesContainer = document.getElementById('services-container');
    servicesContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 50px;">
            <div style="font-size: 24px; color: #e74c3c;">⚠️</div>
            <h3 style="color: #c0392b;">Ошибка загрузки данных</h3>
            <p>Не удалось загрузить список услуг. Пожалуйста, попробуйте обновить страницу.</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: rgb(0,0,55); color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">
                Обновить страницу
            </button>
        </div>
    `;
}

// ЕДИНСТВЕННЫЙ обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM загружен, начинаем инициализацию...');
    
    // Загружаем корзину из localStorage
    loadCartFromStorage();
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    try {
        // Загружаем данные
        const success = await loadServicesData();
        console.log('Данные загружены успешно:', success, 'Данные:', servicesData);
        
        if (success && servicesData && servicesData.length > 0) {
            // Создаем фильтры и рендерим услуги
            createFilters();
            renderFilteredServices();
            
            // Обновляем отображение корзины после загрузки данных
            updateOrderDisplay();
            
            console.log('Услуги отрендерены, корзина восстановлена');
        } else {
            // Показываем сообщение об ошибке
            showErrorMessage();
            console.error('Не удалось загрузить данные или данные пустые');
        }
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showErrorMessage();
    }
    
    // Добавляем обработчики для комбо-наборов
    document.querySelectorAll('.combo-add-btn').forEach(button => {
        button.addEventListener('click', function() {
            const comboType = this.dataset.combo;
            addComboToOrder(comboType);
        });
    });
    
    // Добавляем обработчик для формы заказа
    const orderForm = document.getElementById('customer-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Проверяем, что данные загружены
            if (!servicesData || servicesData.length === 0) {
                showNotification('Данные услуг еще не загружены. Пожалуйста, подождите.', 'error');
                return;
            }
            
            // Проверяем, есть ли выбранные услуги
            if (selectedServices.length === 0) {
                showNotification('Пожалуйста, выберите хотя бы одну услугу для оформления заказа.', 'error');
                return;
            }
            
            // Проверяем комбо-набор с возможностью продолжить
            validateComboSelectionWithConfirmation().then(shouldProceed => {
                if (shouldProceed) {
                    // Продолжаем отправку формы
                    submitOrderForm();
                } else {
                    // Пользователь решил не продолжать
                    console.log('Отправка отменена пользователем');
                }
            });
        });
    }
    
    // Обработчик для уведомлений
    const notificationOk = document.getElementById('notification-ok');
    if (notificationOk) {
        notificationOk.addEventListener('click', function() {
            document.getElementById('notification').classList.add('hidden');
        });
    }
});

// Глобальные переменные для фильтров
let currentFilters = {
    category: 'all',
    price: 'all',
    sort: 'name'
};

// Функция для извлечения числовой цены из строки
function extractPrice(priceString) {
    if (!priceString) return 0;
    const priceMatch = priceString.match(/(\d+[\s\d]*)/);
    return priceMatch ? parseInt(priceMatch[0].replace(/\s/g, '')) : 0;
}

// Функция для применения фильтров
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const priceFilter = document.getElementById('priceFilter')?.value || 'all';
    const sortFilter = document.getElementById('sortFilter')?.value || 'name';
    
    currentFilters = {
        category: categoryFilter,
        price: priceFilter,
        sort: sortFilter
    };
    
    renderFilteredServices();
}

// Функция для фильтрации услуг
function filterServices() {
    // Проверяем, что servicesData загружена
    if (!servicesData || servicesData.length === 0) {
        console.warn('servicesData не загружена');
        return [];
    }
    
    let filteredData = JSON.parse(JSON.stringify(servicesData)); // Глубокая копия
    
    // Фильтрация по категории
    if (currentFilters.category !== 'all') {
        filteredData = filteredData.filter(section => 
            section && section.section === currentFilters.category
        );
    }
    
    // Фильтрация по цене и сортировка внутри каждой секции
    filteredData.forEach(section => {
        if (!section.services) {
            section.services = [];
            return;
        }
        
        // Фильтрация услуг по цене
        if (currentFilters.price !== 'all') {
            section.services = section.services.filter(service => {
                if (!service) return false;
                const price = extractPrice(service.price);
                
                switch (currentFilters.price) {
                    case '0-50000':
                        return price <= 50000;
                    case '50000-100000':
                        return price >= 50000 && price <= 100000;
                    case '100000-150000':
                        return price >= 100000 && price <= 150000;
                    case '150000-200000':
                        return price >= 150000 && price <= 200000;
                    case '200000+':
                        return price >= 200000;
                    default:
                        return true;
                }
            });
        }
        
        // Сортировка услуг
        section.services.sort((a, b) => {
            if (!a || !b) return 0;
            const priceA = extractPrice(a.price);
            const priceB = extractPrice(b.price);
            
            switch (currentFilters.sort) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '', 'ru');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '', 'ru');
                case 'price':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                default:
                    return (a.name || '').localeCompare(b.name || '', 'ru');
            }
        });
    });
    
    return filteredData;
}

// Функция для создания карточки услуги
function createServiceCard(service) {
    if (!service) {
        console.error('Неверные данные услуги:', service);
        return '';
    }
    
    // Получаем эмодзи для услуги
    const serviceEmoji = getServiceEmoji(service);
    
    // Проверяем, выбрана ли уже эта услуга
    const isSelected = selectedServices.some(s => s.id === service.id);
    const selectedClass = isSelected ? 'selected' : '';
    
    return `
        <div class="service-card ${selectedClass}" data-service="${service.id}" data-category="${service.section || ''}">
            <div class="service-image">
                ${serviceEmoji}
            </div>
            <div class="service-info">
                <h3>${service.name || 'Без названия'}</h3>
                <p>${service.description || ''}</p>
                <p class="price">${service.price || 'Цена не указана'}</p>
                <button class="add-to-order" onclick="addToOrder('${service.id}')">${isSelected ? 'Добавлено' : 'Добавить'}</button>
            </div>
        </div>
    `;
}

// Функция для создания секции с услугами
function createServiceSection(sectionData) {
    if (!sectionData || !sectionData.services || sectionData.services.length === 0) {
        return ''; // Не показываем секции без услуг
    }
    
    const servicesHTML = sectionData.services.map(service => 
        createServiceCard(service)
    ).join('');
    
    return `
        <section id="${sectionData.section}" class="service-section">
            <h2>${sectionData.title}</h2>
            <div class="services-grid">
                ${servicesHTML}
            </div>
        </section>
    `;
}

// Функция для отображения сообщения об отсутствии результатов
function showNoResultsMessage() {
    return `
        <div class="no-results">
            <h3>Услуги не найдены</h3>
            <p>Попробуйте изменить параметры фильтрации</p>
            <button onclick="resetFilters()" class="reset-btn" style="margin-top: 15px;">Сбросить фильтры</button>
        </div>
    `;
}

// Функция для рендеринга отфильтрованных услуг
function renderFilteredServices() {
    const servicesContainer = document.getElementById('services-container');
    const filteredData = filterServices();
    
    let hasResults = false;
    const allSectionsHTML = filteredData.map(sectionData => {
        if (sectionData && sectionData.services && sectionData.services.length > 0) {
            hasResults = true;
            return createServiceSection(sectionData);
        }
        return '';
    }).join('');
    
    if (!hasResults) {
        servicesContainer.innerHTML = showNoResultsMessage();
    } else {
        servicesContainer.innerHTML = allSectionsHTML;
    }
}

// Функция сброса фильтров
function resetFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) categoryFilter.value = 'all';
    if (priceFilter) priceFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'name';
    
    currentFilters = {
        category: 'all',
        price: 'all',
        sort: 'name'
    };
    
    renderFilteredServices();
}

function addComboToOrder(comboType) {
    const comboDefinitions = {
        'basic': ['tshirt_print', 'mug_print'],
        'business': ['business_cards', 'flyers', 'pen_print'],
        'premium': ['branded_merch', 'limited_edition', 'premium_packaging']
    };
    
    const selectedCombo = comboDefinitions[comboType];
    
    if (selectedCombo) {
        // Проверяем, не добавлены ли уже услуги из этого комбо
        const currentKeywords = selectedServices.map(service => service.id);
        
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

// Функция для проверки комбо с подтверждением
function validateComboSelectionWithConfirmation() {
    return new Promise((resolve) => {
        const validationResult = validateComboSelection();
        
        if (validationResult.isValid) {
            // Если комбо валидно, сразу продолжаем
            resolve(true);
            return;
        }
        
        // Если комбо невалидно, показываем диалог подтверждения
        showComboConfirmationDialog(validationResult.message, validationResult.missingItems)
            .then(userChoice => {
                resolve(userChoice === 'continue');
            });
    });
}

// Функция для показа диалога подтверждения
function showComboConfirmationDialog(warningMessage, missingItems) {
    return new Promise((resolve) => {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'combo-confirmation-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            text-align: center;
        `;
        
        let messageHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
            <h3 style="color: #e67e22; margin-bottom: 15px;">Внимание!</h3>
            <p style="margin-bottom: 20px; line-height: 1.5;">${warningMessage}</p>
        `;
        
        if (missingItems && missingItems.length > 0) {
            messageHTML += `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0;">
                    <strong>Отсутствующие услуги:</strong>
                    <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
                        ${missingItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        messageHTML += `
            <p style="margin: 20px 0; color: #666;">
                Вы можете вернуться и добавить недостающие услуги или продолжить оформление текущего заказа.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                <button id="combo-go-back" style="
                    padding: 12px 25px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    flex: 1;
                ">Вернуться</button>
                <button id="combo-continue" style="
                    padding: 12px 25px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    flex: 1;
                ">Продолжить</button>
            </div>
        `;
        
        modalContent.innerHTML = messageHTML;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Обработчики для кнопок
        document.getElementById('combo-go-back').addEventListener('click', function() {
            document.body.removeChild(modal);
            resolve('go-back');
        });
        
        document.getElementById('combo-continue').addEventListener('click', function() {
            document.body.removeChild(modal);
            resolve('continue');
        });
        
        // Закрытие по клику на фон
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve('go-back');
            }
        });
    });
}

// Обновленная функция проверки комбо
function validateComboSelection() {
    if (selectedServices.length === 0) {
        return {
            isValid: false,
            message: 'Пожалуйста, выберите хотя бы одну услугу для оформления заказа.',
            missingItems: []
        };
    }
    
    const comboDefinitions = {
        'basic': ['tshirt_print', 'mug_print'],
        'business': ['business_cards', 'flyers', 'pen_print'],
        'premium': ['branded_merch', 'limited_edition', 'premium_packaging']
    };
    
    const selectedKeywords = selectedServices.map(service => service.id);
    
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
    
    if (isValidCombo) {
        return {
            isValid: true,
            message: `Заказ соответствует комбо-набору "${getComboName(matchedCombo)}"`,
            missingItems: []
        };
    }
    
    // Если заказ не соответствует ни одному комбо, ищем наиболее подходящий
    let bestMatch = null;
    let bestMatchMissing = [];
    let bestMatchExtra = [];
    
    for (const [comboName, requiredKeywords] of Object.entries(comboDefinitions)) {
        const missing = requiredKeywords.filter(keyword => !selectedKeywords.includes(keyword));
        const extra = selectedKeywords.filter(keyword => !requiredKeywords.includes(keyword));
        
        // Ищем наиболее подходящий комбо (с наименьшим количеством недостающих услуг)
        if (bestMatch === null || missing.length < bestMatchMissing.length) {
            bestMatch = comboName;
            bestMatchMissing = missing;
            bestMatchExtra = extra;
        }
    }
    
    if (bestMatchMissing.length > 0 || bestMatchExtra.length > 0) {
        const missingItems = bestMatchMissing.map(keyword => {
            // Безопасный поиск услуги - проверяем что servicesData загружена
            let serviceName = keyword;
            if (servicesData && servicesData.length > 0) {
                const service = servicesData.flatMap(section => section.services || []).find(s => s && s.id === keyword);
                if (service && service.name) {
                    serviceName = service.name;
                }
            }
            return serviceName;
        });
        
        const extraItems = bestMatchExtra.map(keyword => {
            // Безопасный поиск услуги
            let serviceName = keyword;
            if (servicesData && servicesData.length > 0) {
                const service = servicesData.flatMap(section => section.services || []).find(s => s && s.id === keyword);
                if (service && service.name) {
                    serviceName = service.name;
                }
            }
            return serviceName;
        });
        
        let message = `Выбранные услуги не образуют полный комбо-набор. `;
        
        if (bestMatchMissing.length > 0) {
            message += `Для завершения набора "${getComboName(bestMatch)}" необходимо добавить: ${missingItems.join(', ')}. `;
        }
        
        if (bestMatchExtra.length > 0) {
            message += `В заказе присутствуют лишние услуги: ${extraItems.join(', ')}.`;
        }
        
        return {
            isValid: false,
            message: message.trim(),
            missingItems: missingItems
        };
    }
    
    return {
        isValid: false,
        message: 'Выбранные услуги не образуют полный комбо-набор. Пожалуйста, выберите один из готовых комбо-наборов или добавьте недостающие услуги.',
        missingItems: []
    };
}

function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationTitle = document.querySelector('.notification-title');
    
    if (!notification) return;
    
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

function createFilters() {
    const categories = {
        'all': 'Все услуги',
        'clothing': 'Одежда',
        'accessories': 'Аксессуары',
        'headwear': 'Головные уборы',
        'premium': 'Премиум',
        'polygraphy': 'Полиграфия',
        'souvenirs': 'Сувениры',
        'delivery': 'Доставка'
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
        'souvenirs': ['all', 'metal', 'magnetic', 'cork', 'cardboard', 'plastic', 'leather'],
        'delivery': ['all', 'standard', 'express']
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
        'leather': 'Кожа',
        'standard': 'Стандартная',
        'express': 'Экспресс'
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
    subFilters.querySelector('.sub-filter-btn[data-kind="all"]')?.classList.add('active');
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

function addToOrder(serviceId) {
    // Проверяем, что servicesData загружена
    if (!servicesData || servicesData.length === 0) {
        console.error('Данные услуг не загружены');
        showNotification('Ошибка: данные услуг не загружены', 'error');
        return;
    }
    
    const service = servicesData.flatMap(section => section.services || []).find(s => s && s.id === serviceId);
    
    if (!service) {
        console.error('Услуга не найдена:', serviceId);
        showNotification('Ошибка: услуга не найдена', 'error');
        return;
    }
    
    // Проверяем, не добавлена ли уже эта услуга
    const alreadyAdded = selectedServices.some(s => s.id === serviceId);
    if (alreadyAdded) {
        showNotification('Эта услуга уже добавлена в заказ.', 'warning');
        return;
    }
    
    // Добавляем услугу в массив
    selectedServices.push(service);
    
    // Сохраняем корзину в localStorage
    saveCartToStorage();
    
    // Выделяем карточку
    const selectedCard = document.querySelector(`.service-card[data-service="${serviceId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        // Обновляем текст кнопки
        const button = selectedCard.querySelector('.add-to-order');
        if (button) {
            button.textContent = 'Добавлено';
        }
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    let total = 0;
    
    if (selectedServices.length === 0) {
        orderContainer.innerHTML = '<p>Ничего не выбрано</p>';
        if (orderTotal) orderTotal.style.display = 'none';
        return;
    }
    
    let orderHTML = '';
    
    // Группируем услуги по категориям для отображения
    const servicesByCategory = {};
    selectedServices.forEach(service => {
        if (!servicesByCategory[service.section]) {
            servicesByCategory[service.section] = [];
        }
        servicesByCategory[service.section].push(service);
    });
    
    for (const category in servicesByCategory) {
        orderHTML += `
            <div class="order-category">
        `;
        
        servicesByCategory[category].forEach(service => {
            orderHTML += `
                <div class="order-item">
                    <span>${service.name} ${service.price}</span>
                    <button class="remove-item" data-service="${service.id}">✕</button>
                </div>
            `;
            total += extractPrice(service.price);
        });
        
        orderHTML += `</div>`;
    }
    
    orderContainer.innerHTML = orderHTML;
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.dataset.service;
            removeFromOrder(serviceId);
        });
    });
    
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `${total}₽`;
    }
    if (orderTotal) {
        orderTotal.style.display = 'block';
    }
}

function getCategoryName(category) {
    const categoryNames = {
        clothing: 'Одежда',
        accessories: 'Аксессуары',
        headwear: 'Головные уборы',
        premium: 'Премиум',
        polygraphy: 'Полиграфия',
        souvenirs: 'Сувениры',
        delivery: 'Доставка'
    };
    
    return categoryNames[category] || category;
}

function removeFromOrder(serviceId) {
    // Удаляем услугу из массива
    selectedServices = selectedServices.filter(service => service.id !== serviceId);
    
    // Сохраняем корзину в localStorage
    saveCartToStorage();
    
    // Снимаем выделение с карточки
    const selectedCard = document.querySelector(`.service-card[data-service="${serviceId}"]`);
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        // Обновляем текст кнопки
        const button = selectedCard.querySelector('.add-to-order');
        if (button) {
            button.textContent = 'Добавить';
        }
    }
    
    updateOrderDisplay();
}

function resetOrder() {
    selectedServices = [];
    
    // Очищаем localStorage
    clearCartFromStorage();
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
        // Обновляем текст кнопки
        const button = card.querySelector('.add-to-order');
        if (button) {
            button.textContent = 'Добавить';
        }
    });
    
    updateOrderDisplay();
}

// Функция для отправки формы заказа
function submitOrderForm() {
    const form = document.getElementById('customer-form');
    const formMethod = form.method.toUpperCase();
    const formAction = form.action;
    
    // Собираем данные формы
    const formData = new FormData(form);
    
    // Добавляем информацию о выбранных услугах
    selectedServices.forEach((service, index) => {
        formData.append(`service_${index}_id`, service.id);
        formData.append(`service_${index}_name`, service.name);
        formData.append(`service_${index}_price`, service.price);
        if (service.description) {
            formData.append(`service_${index}_description`, service.description);
        }
    });
    
    // Добавляем общее количество услуг и общую стоимость
    formData.append('total_services', selectedServices.length);
    formData.append('total_price', calculateTotalPrice());
    
    // Показываем индикатор загрузки
    const submitButton = document.querySelector('.submit-order');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Отправка...';
    submitButton.disabled = true;
    
    // Отправляем как JSON
    submitFormDataJSON(formData, formMethod, formAction)
        .then(success => {
            if (success) {
                // Очищаем корзину после успешной отправки
                resetOrder();
            }
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
}

// Обновленная функция отправки JSON
function submitFormDataJSON(formData, method, action) {
    return new Promise((resolve) => {
        // Преобразуем FormData в объект
        const formObject = {};
        formData.forEach((value, key) => {
            // Если ключ уже существует, преобразуем в массив
            if (formObject[key]) {
                if (!Array.isArray(formObject[key])) {
                    formObject[key] = [formObject[key]];
                }
                formObject[key].push(value);
            } else {
                formObject[key] = value;
            }
        });
        
        // Добавляем информацию об услугах в удобном формате
        formObject.services = selectedServices.map(service => ({
            id: service.id,
            name: service.name,
            price: service.price,
            description: service.description || ''
        }));
        
        // JSON можно отправлять только методами, которые поддерживают тело запроса
        const methodsWithBody = ['POST', 'PUT', 'PATCH'];
        
        if (!methodsWithBody.includes(method)) {
            showNotification('Неподдерживаемый метод для JSON отправки', 'error');
            resolve(false);
            return;
        }
        
        // Отправляем как JSON
        fetch(action, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(data => {
            showNotification('Заказ успешно отправлен!', 'success');
            console.log('Ответ сервера:', data);
            resolve(true);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showNotification('Произошла ошибка при отправке заказа', 'error');
            resolve(false);
        });
    });
}

// Функция для расчета общей стоимости
function calculateTotalPrice() {
    const totalPriceElement = document.getElementById('total-price');
    return totalPriceElement ? totalPriceElement.textContent : '0';
}