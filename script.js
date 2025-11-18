document.addEventListener('DOMContentLoaded', () => {
    const addDayButton = document.getElementById('add-day-button');
    const deleteAllButton = document.getElementById('delete-all-button');
    const saveButton = document.getElementById('save-button');
    const loadPlanButton = document.getElementById('load-plan-button');
    const planFileInput = document.getElementById('plan-file-input');
    const modeToggleButton = document.getElementById('mode-toggle-btn');
    const planTypeSelector = document.getElementById('plan-type-selector');
    const daysContainer = document.getElementById('days-container');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const upgradeModal = document.getElementById('upgrade-modal');
    const closeSettingsButton = document.getElementById('close-settings');
    const closeUpgradeModal = document.getElementById('close-upgrade-modal');
    const upgradeWhatsappBtn = document.getElementById('upgrade-whatsapp-btn');
    let dayCounter = 0;

    // قائمة الحقول الغذائية المتاحة
    const nutritionFields = {
        calories: { label: 'سعرات', unit: '' },
        protein: { label: 'بروتين', unit: 'جرام' },
        carbs: { label: 'كارب', unit: 'جرام' },
        fats: { label: 'دهون', unit: 'جرام' },
        fiber: { label: 'ألياف', unit: 'جرام' },
        sugar: { label: 'سكريات', unit: 'جرام' }
    };


    /**
     * إنشاء قسم وجبة جديد.
     */
    const createMealBlock = () => {
        const planType = planTypeSelector.value;
        const mealBlock = document.createElement('div');
        mealBlock.className = 'meal-block';

        const title = planType === 'diet' ? 'عنوان الوجبة' : 'اسم التمرين';
        const content = planType === 'diet' ? 'أدخل تفاصيل الوجبة...' : 'أدخل ملاحظات التمرين...';
        let detailsHtml = '';

        if (planType === 'diet') {
            document.querySelectorAll('#nutrition-fields-checkboxes input:checked').forEach(checkbox => {
                const fieldKey = checkbox.dataset.field;
                const field = nutritionFields[fieldKey];
                detailsHtml += `<span data-field="${fieldKey}"><strong>${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
            });
        } else { // workout
            detailsHtml = `
                <span class="workout-field"><strong>الوزن:</strong> <span contenteditable="true">0</span> كجم</span>
                <span class="workout-field"><strong>العدادات:</strong> <span contenteditable="true">0</span></span>
                <span class="workout-field"><strong>المجاميع:</strong> <span contenteditable="true">0</span></span>
            `;
        }

        mealBlock.innerHTML = `
            <button class="delete-meal-btn" title="حذف الوجبة">🗑️</button>
            <h3 contenteditable="true">${title}</h3>
            <div class="meal-content" contenteditable="true">${content}</div>
            <div class="meal-details">${detailsHtml}</div>
        `;
        return mealBlock;
    };

    /**
     * إنشاء قسم يوم جديد.
     */
    const createDayBlock = () => {
        dayCounter++;
        const dayBlock = document.createElement('div');
        const addBtnText = planTypeSelector.value === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
        dayBlock.className = 'day-block';
        dayBlock.innerHTML = `
            <div class="day-header">
                <h2 contenteditable="true">اليوم ${dayCounter}</h2>
                <div class="day-header-buttons">
                    <button class="add-meal-btn">${addBtnText}</button>
                    <button class="delete-day-btn" title="حذف اليوم">🗑️</button>
                </div>
            </div>
            <div class="meals-container">
                <!-- سيتم إضافة الوجبات هنا -->
            </div>
        `;
        return dayBlock;
    };

    /**
     * إضافة يوم جديد إلى الصفحة.
     */
    const addDay = () => {
        const settings = getSettings();
        if (settings.isTrial && dayCounter >= 3) {
            showUpgradeModal();
            return;
        }

        const newDay = createDayBlock();
        daysContainer.appendChild(newDay);
    };

    /**
     * حذف جميع الأيام من الصفحة.
     */
    const deleteAllDays = () => {
        if (confirm('هل أنت متأكد من أنك تريد حذف كل شيء؟ لا يمكن التراجع عن هذا الإجراء.')) {
            daysContainer.innerHTML = '';
            dayCounter = 0; // إعادة تعيين العداد
        }
    };

    /**
     * تبديل الوضع بين النهاري والليلي.
     */
    const toggleMode = () => {
        const isDarkMode = modeToggleButton.dataset.mode === 'dark';
        if (isDarkMode) {
            modeToggleButton.dataset.mode = 'light';
            modeToggleButton.innerHTML = 'نهاري ☀️';
        } else {
            modeToggleButton.dataset.mode = 'dark';
            modeToggleButton.innerHTML = 'ليلي 🌙';
        }
    };

    /**
     * تحديث واجهة المستخدم بناءً على نوع الخطة المختار.
     */
    const updateUIForPlanType = () => {
        const planType = planTypeSelector.value;
        const mainHeader = document.querySelector('header h1');
        const mainDescription = document.querySelector('header p.description');
        const addDayBtn = document.getElementById('add-day-button');
        const nutritionFieldsContainer = document.getElementById('nutrition-fields-container');

        if (planType === 'workout') {
            mainHeader.textContent = 'جدول النظام التدريبي';
            mainDescription.textContent = 'قم ببناء خطتك التدريبية بإضافة التمارين لكل يوم.';
            addDayBtn.textContent = '➕ إضافة يوم تدريبي';
            nutritionFieldsContainer.style.display = 'none'; // إخفاء حقول التغذية
        } else { // diet
            mainHeader.textContent = 'جدول النظام الغذائي';
            mainDescription.textContent = 'قم ببناء خطتك الغذائية بإضافة الأيام والوجبات بشكل ديناميكي.';
            addDayBtn.textContent = '➕ إضافة يوم';
            nutritionFieldsContainer.style.display = 'block'; // إظهار حقول التغذية
        }

        // تحديث كل العناصر الحالية في الصفحة
        document.querySelectorAll('.day-block').forEach(dayBlock => {
            const addMealBtn = dayBlock.querySelector('.add-meal-btn');
            if (addMealBtn) {
                addMealBtn.textContent = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
            }

            dayBlock.querySelectorAll('.meal-block').forEach(mealBlock => {
                const details = mealBlock.querySelector('.meal-details');
                let newDetailsHtml = '';
                if (planType === 'diet') {
                    // إعادة بناء الحقول بناءً على الاختيارات الحالية
                    document.querySelectorAll('#nutrition-fields-checkboxes input:checked').forEach(checkbox => {
                        const fieldKey = checkbox.dataset.field;
                        const field = nutritionFields[fieldKey];
                        newDetailsHtml += `<span data-field="${fieldKey}"><strong>${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
                    });
                } else { // workout
                    newDetailsHtml = `
                        <span class="workout-field"><strong>الوزن:</strong> <span contenteditable="true">0</span> كجم</span>
                        <span class="workout-field"><strong>العدادات:</strong> <span contenteditable="true">0</span></span>
                        <span class="workout-field"><strong>المجاميع:</strong> <span contenteditable="true">0</span></span>
                    `;
                }
                details.innerHTML = newDetailsHtml;
            });
        });
    };

    /**
     * يقوم بإنشاء صناديق الاختيار الخاصة بالحقول الغذائية.
 */
    const populateNutritionFields = () => {
        const container = document.getElementById('nutrition-fields-checkboxes');
        container.innerHTML = ''; // مسح المحتوى القديم

        // حقول مفعلة بشكل افتراضي
        const defaultFields = ['calories', 'protein'];

        for (const key in nutritionFields) {
            const field = nutritionFields[key];
            const isChecked = defaultFields.includes(key);
            const checkboxHtml = `
                <label style="display: inline-flex; align-items: center; gap: 5px; font-size: 1em; cursor: pointer; padding: 5px 10px; border-radius: 5px; background-color: #f0f0f0;">
                    <input type="checkbox" data-field="${key}" ${isChecked ? 'checked' : ''}>
                    ${field.label}
                </label>
            `;
            container.innerHTML += checkboxHtml;
        }

        // ربط حدث التغيير لتحديث الواجهة فوراً
        container.addEventListener('change', updateUIForPlanType);
    };

    /**
     * يحتوي على جميع أكواد CSS اللازمة للسمات المختلفة وتنسيق الصفحة المحفوظة.
     */
    const getThemeStyles = () => {
        return `
            /* --- الخطوط الأساسية --- */
            body { font-family: 'Cairo', 'Tajawal', sans-serif; transition: background-color 0.3s, color 0.3s; margin: 0; padding: 20px; line-height: 1.6; }
            /* --- تصميم الحاوية الرئيسية --- */
            .container { max-width: 1200px; margin: 20px auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: background-color 0.3s; }
            header { text-align: center; margin-bottom: 30px; }
            h1 { font-size: 2.8em; margin-bottom: 10px; }
            p.description { font-size: 1.2em; }
            /* --- تصميم الأيام والوجبات (مشترك) --- */
            #days-container { display: flex; flex-direction: column; gap: 30px; }
            .day-block { border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: background-color 0.3s, border-color 0.3s; }
            .day-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 20px; }
            .day-header h2 { margin: 0; font-size: 2em; }
            .meals-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .meal-block { border-radius: 6px; padding: 15px; transition: background-color 0.3s, border-color 0.3s; }
            .meal-block [contenteditable="true"] { background-color: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; }

            /* --- تصميم رأس الصفحة (البانر) --- */
            .banner-wrapper {
                position: relative;
                border-radius: 12px;
                overflow: hidden; /* لإخفاء أي أجزاء من الصورة تتجاوز الحدود الدائرية */
                margin-bottom: 30px;
            }
            .banner-header {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-size: cover;
                background-position: center 30%;
                z-index: 1;
            }
            .banner-content {
                position: relative;
                z-index: 2;
                padding: 60px 20px;
                text-align: center;
                color: white;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8));
            }
            .banner-content h1 { color: white; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
            .banner-content p.description { color: #f0f0f0; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }

            /* --- تصميم رأس الصفحة البسيط (بدون صورة) --- */
            .simple-header {
                padding: 40px 20px;
                background: var(--accent-color, #3498db);
                color: white;
                border-radius: 12px;
                margin-bottom: 30px;
                text-align: center;
                box-shadow: 0 8px 15px rgba(0,0,0,0.1);
            }
            .simple-header h1 { color: white; text-shadow: none; margin: 0 0 10px 0; }
            .simple-header p.description { color: rgba(255, 255, 255, 0.9); text-shadow: none; font-size: 1.3em; }

            .meal-block h3 { margin: 0 0 10px 0; font-size: 1.3em; padding-bottom: 8px; }
            .meal-details span { display: block; margin-top: 8px; }

            /* --- تصميم قسم اليوم القابل للطي (في الملف المحفوظ) --- */
            .day-header {
                cursor: pointer;
                position: relative;
                padding-right: 30px; /* مساحة للسهم في اليمين (RTL) */
            }
            .day-header::before {
                content: '▲';
                position: absolute;
                right: 0; /* السهم على اليمين */
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8em;
                color: var(--accent-color, #3498db);
                transition: transform 0.3s ease;
            }
            .day-block.collapsed .day-header::before {
                transform: translateY(-50%) rotate(180deg);
            }
            .day-block.collapsed .meals-container { display: none; }

            /* --- 🎨 السمات اللونية 🎨 --- */
            /* منع التفاعل مع الصور */
            img {
                pointer-events: none;
            }
            /* 1. السمة الافتراضية (أزرق) */
            body.default-light { --accent-color: #3498db; --accent-color-dark: #2980b9; --text-color-headings: #2c3e50; background-color: #f4f7f6; color: #333; }
            .default-light .container { background-color: #ffffff; }
            .default-light .day-block { background: #fff; border: 1px solid #e0e0e0; }
            .default-light .day-header { border-bottom: 2px solid var(--accent-color); }
            .default-light h1, .default-light .day-header h2 { color: var(--text-color-headings); }
            .default-light p.description { color: #7f8c8d; }
            .default-light .meal-block { background: #f9f9f9; border: 1px solid #ddd; }
            .default-light .meal-block h3 { color: #34495e; border-bottom: 1px solid #eee; }
            .default-light .captain-name { color: var(--accent-color); }

            /* 2. نسيم المحيط (أزرق) */
            body.ocean-blue { --accent-color: #0077b6; --accent-color-dark: #023e8a; --text-color-headings: #023e8a; background-color: #eef7ff; color: #2c3e50; }
            .ocean-blue .container { background-color: #ffffff; }
            .ocean-blue .day-header { border-bottom: 2px solid var(--accent-color); }
            .ocean-blue h1, .ocean-blue .day-header h2 { color: var(--text-color-headings); }
            .ocean-blue .meal-block { background: #f0f8ff; border: 1px solid #ade8f4; }
            .ocean-blue .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #caf0f8; }
            .ocean-blue .signature-footer { background-color: #f0f8ff; border-top-color: #ade8f4; }
            .ocean-blue .captain-name { color: var(--accent-color-dark); }

            /* 3. هدوء الغابة (أخضر) */
            body.forest-green { --accent-color: #2d6a4f; --accent-color-dark: #1b4332; --text-color-headings: #1b4332; background-color: #f0fff4; color: #1e4620; }
            .forest-green .container { background-color: #ffffff; }
            .forest-green .day-header { border-bottom: 2px solid var(--accent-color); }
            .forest-green h1, .forest-green .day-header h2 { color: var(--text-color-headings); }
            .forest-green .meal-block { background: #f6fff8; border: 1px solid #b7e4c7; }
            .forest-green .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #d8f3dc; }
            .forest-green .signature-footer { background-color: #f6fff8; border-top-color: #b7e4c7; }
            .forest-green .captain-name { color: var(--accent-color-dark); }

            /* 4. اللمسة الملكية (ذهبي) */
            body.royal-gold { --accent-color: #c5a773; --accent-color-dark: #8a6d3b; --text-color-headings: #8a6d3b; background-color: #fffaf0; color: #5d4037; }
            .royal-gold .container { background-color: #ffffff; }
            .royal-gold .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-gold h1, .royal-gold .day-header h2 { color: var(--text-color-headings); }
            .royal-gold .meal-block { background: #fffdf9; border: 1px solid #e0d2b4; }
            .royal-gold .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #f5efe2; }
            .royal-gold .signature-footer { background-color: #fffdf9; border-top-color: #e0d2b4; }
            .royal-gold .captain-name { color: var(--accent-color-dark); text-shadow: 0 0 5px rgba(212, 175, 55, 0.3); }

            /* 5. الاحترافي (رمادي) */
            body.professional-gray { --accent-color: #495057; --accent-color-dark: #343a40; --text-color-headings: #343a40; background-color: #f8f9fa; color: #212529; }
            .professional-gray .container { background-color: #ffffff; }
            .professional-gray .day-header { border-bottom: 2px solid var(--accent-color); }
            .professional-gray h1, .professional-gray .day-header h2 { color: var(--text-color-headings); }
            .professional-gray .meal-block { background: #f8f9fa; border: 1px solid #dee2e6; }
            .professional-gray .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #e9ecef; }
            .professional-gray .signature-footer { background-color: #f8f9fa; border-top-color: #dee2e6; }
            .professional-gray .captain-name { color: var(--accent-color-dark); }

            /* 6. غروب الشمس (برتقالي) */
            body.sunset-orange { --accent-color: #f28c18; --accent-color-dark: #d97706; --text-color-headings: #c2410c; background-color: #fff7ed; color: #7c2d12; }
            .sunset-orange .container { background-color: #ffffff; }
            .sunset-orange .day-header { border-bottom: 2px solid var(--accent-color); }
            .sunset-orange h1, .sunset-orange .day-header h2 { color: var(--text-color-headings); }
            .sunset-orange .meal-block { background: #fffbeb; border: 1px solid #fed7aa; }
            .sunset-orange .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ffedd5; }
            .sunset-orange .signature-footer { background-color: #fffbeb; border-top-color: #fed7aa; }
            .sunset-orange .captain-name { color: var(--accent-color-dark); }

            /* 7. ملكي (بنفسجي) */
            body.royal-purple { --accent-color: #8b5cf6; --accent-color-dark: #7c3aed; --text-color-headings: #6d28d9; background-color: #f5f3ff; color: #5b21b6; }
            .royal-purple .container { background-color: #ffffff; }
            .royal-purple .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-purple h1, .royal-purple .day-header h2 { color: var(--text-color-headings); }
            .royal-purple .meal-block { background: #faf5ff; border: 1px solid #ddd6fe; }
            .royal-purple .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ede9fe; }
            .royal-purple .signature-footer { background-color: #faf5ff; border-top-color: #ddd6fe; }
            .royal-purple .captain-name { color: var(--accent-color-dark); }

            /* 8. تصميم بناتي (وردي) */
            body.girly-pink { --accent-color: #ff69b4; --accent-color-dark: #c71585; --text-color-headings: #db7093; background-color: #fff0f5; color: #6d2f4b; }
            .girly-pink .container { background-color: #ffffff; }
            .girly-pink .day-header { border-bottom: 2px solid var(--accent-color); }
            .girly-pink h1, .girly-pink .day-header h2 { color: var(--text-color-headings); }
            .girly-pink .meal-block { background: #fff5fa; border: 1px solid #ffc1d5; }
            .girly-pink .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ffe4e1; }
            .girly-pink .signature-footer { background-color: #fff5fa; border-top-color: #ffc1d5; }
            .girly-pink .captain-name { color: var(--accent-color-dark); text-shadow: 0 0 8px rgba(255, 105, 180, 0.4); }
            /* إضافة تمويه للصور في التصميم البناتي */
            .girly-pink .signature-images img,
            .girly-pink .gallery-item img { filter: blur(8px); }
            .girly-pink .banner-header { filter: blur(12px); transform: scale(1.1); }

            /* --- ✍️ تصميم توقيع الكابتن ✍️ --- */
            .signature-footer { margin-top: 50px; padding: 40px 20px; border-top: 2px solid #e0e0e0; text-align: center; font-family: 'Tajawal', sans-serif; background-color: #fff; }
            .signature-content .prepared-by { font-size: 1.1em; color: #888; margin: 0; }
            .signature-content .captain-name { font-size: 2.8em; font-weight: 700; margin: 5px 0; letter-spacing: 1px; color: #3498db; /* اللون الافتراضي */ }
            .signature-content .captain-title { font-size: 1.3em; color: #555; margin: 0 0 25px 0; }
            .signature-images { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
            .signature-images img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
            .signature-images img:hover { transform: scale(1.05); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }
            .whatsapp-button { display: inline-flex; align-items: center; gap: 10px; background-color: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-size: 1.2em; font-weight: bold; transition: transform 0.2s, background-color 0.2s; }
            .whatsapp-button:hover { background-color: #1DAE54; transform: scale(1.05); }

            /* --- تصميم التوقيع الكلاسيكي --- */
            .classic-signature { margin-top: 40px; padding: 30px; background: linear-gradient(145deg, #2c3e50, #1f2937); color: #f9fafb; border-radius: 12px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            .classic-signature .personal-details h2 { font-size: 2.8em; margin: 0 0 10px; color: #ffffff; font-weight: 700; }
            .classic-signature .personal-details h3 { font-size: 1.6em; margin: 0 0 25px; color: #5294e2; font-weight: 400; }
            .classic-signature .image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 35px; }
            .classic-signature .gallery-item img { width: 100%; height: auto; border-radius: 8px; border: 4px solid #3b82f6; transition: transform 0.3s ease, box-shadow 0.3s ease; display: block; }
            .classic-signature .gallery-item img:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(59, 130, 246, 0.7); }
            .classic-signature .share-section { margin-top: 40px; text-align: center; padding: 25px; background: rgba(0,0,0,0.1); border-radius: 8px; }
            .classic-signature .share-section p { font-size: 1.1em; color: #d1d5db; margin: 0 0 15px; }

            /* --- تصميم التوقيع الحديث --- */
            .modern-signature { margin-top: 50px; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; background-color: #fff; }
            .modern-signature .modern-images { display: flex; width: 100%; }
            .modern-signature .modern-images img { width: calc(100% / 3); height: 200px; object-fit: cover; }
            .modern-signature .modern-content { padding: 30px; text-align: center; width: 100%; }
            .modern-signature .captain-name { font-size: 2.5em; font-weight: 700; margin: 0 0 5px 0; }
            .modern-signature .captain-title { font-size: 1.2em; color: #777; margin-bottom: 25px; }

            /* --- تصميم توقيع اللوجو فقط --- */
            .logo-only-signature { margin-top: 50px; padding: 40px 20px; text-align: center; }
            .logo-only-signature img { max-width: 180px; width: 100%; height: auto; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); }

            /* --- 🌙 الوضع الليلي 🌙 --- */
            body.dark-theme { background-color: #121212; color: #e0e0e0; }
            .dark-theme .container { background-color: #1e1e1e; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); }
            .dark-theme h1, .dark-theme .day-header h2 { color: #ffffff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme p.description { color: #a0a0a0; }
            .dark-theme .day-block { background: #2a2a2a; border: 1px solid #444; }
            .dark-theme .day-header { border-bottom-color: var(--accent-color); }
            .dark-theme .meal-block { background: #333; border: 1px solid #555; }
            .dark-theme .meal-block h3 { color: #e0e0e0; border-bottom: 1px solid #555; }
            .dark-theme .banner-content { background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3), rgba(0,0,0,0.9)); }
            .dark-theme .signature-footer { border-top-color: #444; background-color: #1e1e1e; }
            .dark-theme .simple-header { background: var(--accent-color-dark, #2980b9); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
            .dark-theme .captain-name { color: var(--accent-color); text-shadow: 0 0 10px var(--accent-color); }
            .dark-theme .captain-title, .dark-theme .prepared-by { color: #bbb; }
            /* توقيع كلاسيكي */
            .dark-theme .classic-signature { background: linear-gradient(145deg, #2a2a2a, #1a1a1a); }
            .dark-theme .classic-signature .personal-details h3 { color: var(--accent-color); }
            .dark-theme .classic-signature .gallery-item img { border-color: var(--accent-color); }
            .dark-theme .modern-signature { background-color: #1e1e1e; border-color: #444; }
            .dark-theme .modern-signature .captain-name { color: #fff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme .modern-signature .captain-title { color: #bbb; }
            .dark-theme .logo-only-signature img { box-shadow: 0 8px 25px rgba(0,0,0,0.4); }

            /* --- 📱 تصميم متجاوب مع الموبايل 📱 --- */
            @media (max-width: 768px) { 
                body { padding: 10px; }
                .container { padding: 15px; }
                .banner-content { padding: 40px 15px; }
                h1, .banner-header h1 { font-size: 2em; }
                .day-header h2 { font-size: 1.5em; }
                .meal-block h3 { font-size: 1.1em; }
                .signature-images img { width: 80px; height: 80px; }
                .signature-content .captain-name { font-size: 2em; }
                .classic-signature .image-gallery { grid-template-columns: 1fr; }
                .modern-signature .modern-images { flex-direction: column; }
                .modern-signature .modern-images img { width: 100%; height: 150px; }

                /* --- Layout 1: Vertical List (Default) --- */
                .mobile-vertical .meals-container { 
                    grid-template-columns: 1fr; 
                }

                /* --- Layout 2: Compact Grid --- */
                .mobile-grid .meals-container { 
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .mobile-grid .meal-block { padding: 10px; }
                .mobile-grid .meal-block h3 { font-size: 1em; }

                /* --- Layout 3: Simplified Cards --- */
                .mobile-cards .meals-container {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .mobile-cards .day-block { padding: 15px; }
                .mobile-cards .meal-block {
                    box-shadow: none;
                    border-radius: 4px;
                    border-left: 4px solid var(--accent-color, #3498db);
                }
            }
        `;
    };

    /**
     * تجلب صورة من رابط وتحولها إلى سلسلة Base64.
     * @param {string} url - رابط الصورة على الإنترنت.
     * @returns {string} - سلسلة Base64 للصورة.
     */
    const imageUrlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`فشل تحميل الصورة: ${url}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(error);
            alert(`حدث خطأ أثناء تحميل إحدى الصور. قد لا تظهر في الملف المحفوظ.\nالخطأ: ${error.message}`);
            return url; // في حالة الفشل، يتم الرجوع إلى الرابط الأصلي
        }
    };

    /**
     * يحفظ الخطة الحالية كملف HTML للقراءة فقط.
     */
    const savePlanAsHtml = () => {
        const fileName = prompt("الرجاء إدخال اسم للملف لحفظ الخطة:", "خطة غذائية");
        if (!fileName || fileName.trim() === "") {
            alert("تم إلغاء الحفظ. لم يتم إدخال اسم للملف.");
            return;
        }

        // 1. احصل على السمة المختارة من القائمة المنسدلة
        let selectedTheme = document.getElementById('theme-selector').value;
        const themeName = document.getElementById('theme-selector').options[document.getElementById('theme-selector').selectedIndex].text;
        const planType = planTypeSelector.value;
        const isDarkMode = modeToggleButton.dataset.mode === 'dark';
        const signatureLayout = document.getElementById('signature-layout-selector').value;
        const mobileLayout = document.getElementById('mobile-layout-selector').value;

        // التحقق من التصميم البناتي وتغيير الإعدادات
        if (mobileLayout === 'mobile-girly') {
            selectedTheme = 'girly-pink'; // فرض السمة الوردية
            // سيتم تطبيق التمويه عبر CSS بدلاً من تغيير الصور
        }

        // 2. استنساخ حاوية الأيام فقط وتنظيفها
        const daysContainerClone = daysContainer.cloneNode(true);
        daysContainerClone.querySelectorAll('.delete-day-btn, .add-meal-btn, .delete-meal-btn').forEach(btn => btn.remove());
        
        daysContainerClone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
        });
        daysContainerClone.querySelectorAll('.day-block').forEach(dayBlock => {
            dayBlock.classList.add('collapsed'); // إضافة حالة الطي الافتراضية
        });
        let dietPlanHtml = daysContainerClone.innerHTML;

        // 3. تعريف روابط الصور
        const settings = getSettings();
        const img1 = settings.imgBanner;
        const img2 = settings.imgSig1;
        const img3 = settings.imgSig2;
        const imgLogo = settings.imgLogo;

        // 4. إنشاء قسم التوقيع بناءً على الاختيار
        let signatureHtml = '';
        const whatsappButton = `<a href="#" id="whatsapp-share-btn" class="whatsapp-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-10.8-94.2-30.6l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.8-16.2-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg><span>تواصل عبر واتساب</span></a>`;

        if (settings.signatureType === 'logo-only') {
            // تصميم جديد يعتمد على اللوجو فقط
            signatureHtml = `
                <footer class="logo-only-signature">
                    <img src="${imgLogo}" alt="شعار الكابتن ${settings.captainName}">
                    <div class="signature-content">
                        <p class="prepared-by">تم إعداد هذا البرنامج بواسطة</p>
                        <h3 class="captain-name">${settings.captainName}</h3>
                        <p class="captain-title">خبير التغذية واللياقة البدنية - مصنع العضلات</p>
                        ${whatsappButton}
                    </div>
                </footer>`;
        } else {
            // التصاميم القياسية التي تعتمد على صورتين
            if (signatureLayout === 'professional') {
                signatureHtml = `<footer class="signature-footer"><div class="signature-images"><img src="${img2}" alt="صورة للكابتن ${settings.captainName} 2"><img src="${img3}" alt="صورة للكابتن ${settings.captainName} 3"></div><div class="signature-content"><p class="prepared-by">تم إعداد هذا البرنامج بواسطة</p><h3 class="captain-name">${settings.captainName}</h3><p class="captain-title">خبير التغذية واللياقة البدنية - مصنع العضلات</p>${whatsappButton}</div></footer>`;
            } else if (signatureLayout === 'classic') {
                signatureHtml = `<div class="classic-signature"><div class="personal-details"><h2>${settings.captainName}</h2><h3>مصنع العضلات - Muscle Factory</h3></div><div class="image-gallery" style="grid-template-columns: repeat(2, 1fr);"><div class="gallery-item"><img src="${img2}" alt="صورة 2"></div><div class="gallery-item"><img src="${img3}" alt="صورة 3"></div></div><div class="share-section"><p>للاستفسار أو تعديل الخطة، تواصل معي مباشرة!</p>${whatsappButton}</div></div>`;
            } else if (signatureLayout === 'modern') {
                signatureHtml = `<footer class="modern-signature"><div class="modern-images" style="--img-count: 2;"><img src="${img2}" alt="صورة للكابتن ${settings.captainName} 2"><img src="${img3}" alt="صورة للكابتن ${settings.captainName} 3"></div><div class="modern-content"><h3 class="captain-name">${settings.captainName}</h3><p class="captain-title">خبير التغذية واللياقة البدنية - مصنع العضلات</p>${whatsappButton}</div></footer>`;
            }
        }

        // 5. إضافة كود الحفظ التلقائي وتفعيل التعديل فقط لخطة التدريب
        let interactiveWorkoutScript = '';
        let workoutCounter = 0;
        if (planType === 'workout') {
            daysContainerClone.querySelectorAll('.meal-block').forEach((mealBlock) => {
                const workoutId = `workout-${workoutCounter++}`;
                const setsSpan = mealBlock.querySelector('.workout-field:nth-child(3) span');
                const setCount = parseInt(setsSpan?.textContent, 10) || 4; // القيمة الافتراضية هي 4 مجموعات

                // إنشاء هيكل التحكم التفاعلي
                const controlsHtml = `
                    <div class="workout-controls" data-workout-id="${workoutId}">
                        <label class="set-slider-label">
                            المجموعة: <span class="current-set-number">1</span> / ${setCount}
                        </label>
                        <input type="range" class="set-slider" value="1" min="1" max="${setCount}" title="اختر المجموعة لتعديلها">
                    </div>
                `;

                // استبدال حقول الوزن والعدادات والمجاميع بالهيكل الجديد
                const detailsContainer = mealBlock.querySelector('.meal-details');
                detailsContainer.innerHTML = `
                    ${controlsHtml}
                    <span class="workout-field">
                        <strong>الوزن:</strong> 
                        <span contenteditable="true" data-type="weight">0</span> كجم
                    </span>
                    <span class="workout-field">
                        <strong>العدادات:</strong> 
                        <span contenteditable="true" data-type="reps">0</span>
                    </span>
                `;
            });

            dietPlanHtml = daysContainerClone.innerHTML; // تحديث المحتوى بعد تعديل الهيكل

            interactiveWorkoutScript = `
                <script>
                    const planId = 'workout-plan-storage';

                    function updateWorkoutDisplay(workoutBlock) {
                        const workoutId = workoutBlock.dataset.workoutId;
                        const slider = workoutBlock.querySelector('.set-slider');
                        const currentSet = slider.value;
                        workoutBlock.querySelector('.current-set-number').textContent = currentSet;

                        const savedData = JSON.parse(localStorage.getItem(planId + '-' + workoutId) || '{}');
                        const setData = savedData[currentSet] || { weight: '0', reps: '0' };

                        const mealBlock = workoutBlock.closest('.meal-block');
                        mealBlock.querySelector('[data-type="weight"]').textContent = setData.weight;
                        mealBlock.querySelector('[data-type="reps"]').textContent = setData.reps;
                    }

                    document.querySelectorAll('.workout-controls').forEach(workoutBlock => {
                        updateWorkoutDisplay(workoutBlock);

                        workoutBlock.querySelector('.set-slider').addEventListener('input', () => {
                            updateWorkoutDisplay(workoutBlock);
                        });

                        workoutBlock.closest('.meal-block').addEventListener('input', (e) => {
                            if (e.target.isContentEditable) {
                                const workoutId = workoutBlock.dataset.workoutId;
                                const currentSet = workoutBlock.querySelector('.set-slider').value;
                                
                                let savedData = JSON.parse(localStorage.getItem(planId + '-' + workoutId) || '{}');
                                if (!savedData[currentSet]) savedData[currentSet] = {};
                                
                                savedData[currentSet][e.target.dataset.type] = e.target.textContent;
                                
                                localStorage.setItem(planId + '-' + workoutId, JSON.stringify(savedData));
                            }
                        });
                    });
                <\/script>
            `;
        }

        // 5.5 إنشاء رأس الصفحة (البانر)
        let bannerHeaderHtml = '';
        if (settings.signatureType === 'logo-only') {
            // استخدام التصميم البسيط بدون صورة بانر
            bannerHeaderHtml = `
                <header class="simple-header">
                    <h1>${planType === 'diet' ? 'جدول النظام الغذائي' : 'جدول النظام التدريبي'}</h1>
                    <p class="description">خطة "${fileName}"</p>
                </header>
            `;
        } else {
            // استخدام التصميم الافتراضي مع صورة البانر
            bannerHeaderHtml = `
                <div class="banner-wrapper">
                    <div class="banner-header" style="background-image: url('${img1}');"></div>
                    <div class="banner-content">
                        <h1>${planType === 'diet' ? 'جدول النظام الغذائي' : 'جدول النظام التدريبي'}</h1>
                        <p class="description">خطة "${fileName}"</p>
                    </div>
                </div>
            `;
        }

        // 6. تجميع كود HTML الكامل للصفحة الجديدة
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${fileName.trim()}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    ${getThemeStyles()}
                </style>
            </head>
            <body class="${selectedTheme} ${isDarkMode ? 'dark-theme' : ''} ${mobileLayout}">
                <div class="container">
                    ${bannerHeaderHtml} 
                    <div id="days-container">${dietPlanHtml}</div>
                    ${signatureHtml}
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        // كود تفعيل خاصية الطي والفتح
                        document.getElementById('days-container').addEventListener('click', function(event) {
                            const dayHeader = event.target.closest('.day-header');
                            if (dayHeader && !event.target.closest('a')) {
                                const dayBlock = dayHeader.closest('.day-block');
                                if (dayBlock) {
                                    dayBlock.classList.toggle('collapsed');
                                }
                            }
                        });

                    // كود قراءة الإعدادات من الرابط
                    const urlParams = new URLSearchParams(window.location.search);
                    const userKey = urlParams.get('user');
                    // ملاحظة: هذا الكود يعمل في الملف المحفوظ، لكن منطق جلب الإعدادات الخاصة بالمستخدم يجب أن يكون مدمجاً في وقت الإنشاء.

                        // كود زر الواتساب
                        const whatsappBtn = document.getElementById('whatsapp-share-btn');
                        if (whatsappBtn) {
                            whatsappBtn.addEventListener('click', function(e) {
                                e.preventDefault();
                                const phoneNumber = "${settings.whatsappNumber}";
                                const message = "${settings.whatsappMessage}";
                                const encodedMessage = encodeURIComponent(message);
                                window.open('https://wa.me/' + phoneNumber + '?text=' + encodedMessage, '_blank');
                            });
                        }
                    });
                </script>
                ${interactiveWorkoutScript}
            </body>
            </html>
        `;

        // 7. تعمية (تشفير) المحتوى بالكامل لمنع التعديل السهل
        const encodedHtml = btoa(unescape(encodeURIComponent(fullHtml)));

        // 8. إنشاء ملف HTML الحاضن الذي سيقوم بفك التشفير
        const obfuscatedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName.trim()}</title>
                <meta charset="UTF-8">
                <style>body{font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f0f0f0;}</style>
            </head>
            <body>
                <script>
                    try {
                        document.write(decodeURIComponent(escape(atob('${encodedHtml}'))));
                    } catch (e) {
                        document.body.innerHTML = '<h1>حدث خطأ أثناء عرض محتوى الصفحة.</h1>';
                    }
                <\/script>
                <noscript>
                    <h1>يرجى تفعيل الجافاسكريبت لعرض هذه الصفحة.</h1>
                </noscript>
            </body>
            </html>
        `;

        // 9. إنشاء وتنزيل الملف المعمى (المشفر)
        const blob = new Blob([obfuscatedHtml], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName.trim()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        alert(`تم تجهيز الملف "${fileName.trim()}.html" للتنزيل.`);
    };

    /**
     * يقرأ ملف خطة HTML المحفوظ ويعيد تحميله في المحرر.
     * @param {Event} event - حدث تغيير حقل إدخال الملف.
     */
    const loadPlanFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;

                // 1. استخراج المحتوى المشفر وفك تشفيره
                const base64Match = fileContent.match(/atob\('([^']+)'\)/);
                if (!base64Match || !base64Match[1]) {
                    throw new Error("الملف غير صالح أو لا يحتوي على محتوى مشفر.");
                }
                const decodedHtml = decodeURIComponent(escape(atob(base64Match[1])));

                // 2. إنشاء عنصر DOM مؤقت لتحليل المحتوى
                const parser = new DOMParser();
                const doc = parser.parseFromString(decodedHtml, 'text/html');

                // 3. استخراج الإعدادات من الملف المحمل
                const bodyClasses = doc.body.className.split(' ');
                const theme = bodyClasses.find(c => c.endsWith('-light') || ['ocean-blue', 'forest-green', 'royal-gold', 'professional-gray', 'sunset-orange', 'royal-purple'].includes(c)) || 'default-light';
                const isDarkMode = bodyClasses.includes('dark-theme');
                const planType = doc.querySelector('.banner-content h1')?.textContent.includes('التدريبي') ? 'workout' : 'diet';
                const signatureElement = doc.querySelector('footer, .classic-signature');
                let signatureLayout = 'professional';
                const mobileLayout = bodyClasses.find(c => c.startsWith('mobile-')) || 'mobile-vertical';
                if (signatureElement) {
                    if (signatureElement.classList.contains('classic-signature')) signatureLayout = 'classic';
                    else if (signatureElement.classList.contains('modern-signature')) signatureLayout = 'modern';
                }

                // 4. استخراج محتوى الأيام وإعادة بنائه ليكون قابلاً للتعديل
                const loadedDaysContainer = doc.getElementById('days-container');
                if (!loadedDaysContainer) {
                    throw new Error("لم يتم العثور على حاوية الأيام في الملف.");
                }

                // إعادة تفعيل حقول التعديل وإضافة الأزرار المحذوفة
                loadedDaysContainer.querySelectorAll('.day-block').forEach(dayBlock => {
                    dayBlock.querySelector('.day-header h2').setAttribute('contenteditable', 'true');
                    const addBtnText = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
                    const dayHeaderButtons = dayBlock.querySelector('.day-header-buttons');
                    dayHeaderButtons.innerHTML = `
                        <button class="add-meal-btn">${addBtnText}</button>
                        <button class="delete-day-btn" title="حذف اليوم">🗑️</button>
                    `;

                    dayBlock.querySelectorAll('.meal-block').forEach(mealBlock => {
                        mealBlock.querySelector('h3').setAttribute('contenteditable', 'true');
                        mealBlock.querySelector('.meal-content').setAttribute('contenteditable', 'true');
                        mealBlock.querySelectorAll('.meal-details span[contenteditable]').forEach(span => span.setAttribute('contenteditable', 'true'));
                        
                        // إضافة زر حذف الوجبة
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-meal-btn';
                        deleteBtn.title = 'حذف الوجبة';
                        deleteBtn.innerHTML = '🗑️';
                        mealBlock.prepend(deleteBtn);
                    });
                });

                // 5. تحديث الصفحة بالمحتوى الجديد
                daysContainer.innerHTML = loadedDaysContainer.innerHTML;
                dayCounter = daysContainer.querySelectorAll('.day-block').length;

                // 6. تحديث عناصر التحكم في الواجهة الرئيسية
                planTypeSelector.value = planType;
                document.getElementById('theme-selector').value = theme;
                document.getElementById('signature-layout-selector').value = signatureLayout;
                document.getElementById('mobile-layout-selector').value = mobileLayout;
                
                if ((isDarkMode && modeToggleButton.dataset.mode !== 'dark') || (!isDarkMode && modeToggleButton.dataset.mode === 'dark')) {
                    toggleMode(); // تبديل الوضع إذا كان مختلفًا
                }
                
                updateUIForPlanType(); // تحديث الواجهة لتطابق نوع الخطة

                alert("تم استعادة الخطة بنجاح وجاهزة للتعديل.");

            } catch (error) {
                console.error("فشل في تحميل الخطة:", error);
                alert(`حدث خطأ أثناء محاولة استعادة الملف. قد يكون الملف غير صالح.\n${error.message}`);
            } finally {
                // إعادة تعيين حقل الإدخال للسماح بتحميل نفس الملف مرة أخرى
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    // --- 🔑 قسم لوحة التحكم الآمنة (ADMIN) 🔑 ---


    /**
     * [وهمية] دالة لجلب الإعدادات من السيرفر.
     * **ملاحظة:** يجب استبدال هذا الكود باتصال حقيقي بالسيرفر الخاص بك.
     */
    const fetchSettingsFromServer = async () => {
        console.log("محاولة جلب الإعدادات من السيرفر (دالة وهمية)...");
        // في الوضع الحقيقي، ستقوم بعمل fetch لـ API حقيقي
        // const response = await fetch('https://your-api.com/settings');
        // const settings = await response.json();
        // return settings;

        // حالياً، سنقوم بالقراءة من localStorage كحل بديل
        const savedSettings = localStorage.getItem('dietPlanGeneratorSettings');
        return savedSettings ? JSON.parse(savedSettings) : null;
    };

    /**
     * [وهمية] دالة لحفظ الإعدادات في السيرفر.
     * @param {object} settings - كائن الإعدادات المراد حفظه.
     */
    const saveSettingsToServer = async (settings) => {
        console.log("محاولة حفظ الإعدادات في السيرفر (دالة وهمية)...", settings);
        // في الوضع الحقيقي، ستقوم بعمل fetch لـ API حقيقي
        // await fetch('https://your-api.com/settings', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(settings)
        // });

        // حالياً، سنقوم بالحفظ في localStorage كحل بديل
        localStorage.setItem('dietPlanGeneratorSettings', JSON.stringify(settings));
    };

    /**
     * يحفظ الإعدادات من النافذة المنبثقة إلى localStorage.
     */
    const saveSettings = () => {
        const settings = {
            userKey: document.getElementById('settings-user-key').value.trim(),
            isTrial: document.getElementById('settings-trial-version').checked,
            signatureType: document.getElementById('settings-signature-type').value,
            captainName: document.getElementById('settings-captain-name').value,
            whatsappNumber: document.getElementById('settings-whatsapp-number').value,
            whatsappMessage: document.getElementById('settings-whatsapp-message').value,
            imgBanner: document.getElementById('settings-img-banner').value,
            imgSig1: document.getElementById('settings-img-sig1').value,
            imgSig2: document.getElementById('settings-img-sig2').value,
            imgLogo: document.getElementById('settings-img-logo').value,
        };
        // استدعاء الدالة الوهمية لحفظ الإعدادات
        if (!settings.userKey) {
            alert("خطأ: حقل 'مفتاح المستخدم' لا يمكن أن يكون فارغاً.");
            return;
        }

        // جلب كائن المستخدمين الحالي
        const allUserSettings = JSON.parse(localStorage.getItem('dietPlanUserProfiles') || '{}');
        // تحديث أو إضافة المستخدم الحالي
        allUserSettings[settings.userKey] = settings;
        // حفظ الكائن المحدث
        localStorage.setItem('dietPlanUserProfiles', JSON.stringify(allUserSettings));

        alert(`تم حفظ الإعدادات للمستخدم '${settings.userKey}' بنجاح!`);
        settingsModal.style.display = 'none';
    };

    /**
     * يقرأ الإعدادات من localStorage ويعرضها في النافذة المنبثقة.
     */
    const loadSettings = (userKey = null) => {
        let settings;
        if (userKey) {
            const allUserSettings = JSON.parse(localStorage.getItem('dietPlanUserProfiles') || '{}');
            settings = allUserSettings[userKey] || getSettings(); // إذا لم يتم العثور على المستخدم، استخدم الافتراضيات
        } else {
            settings = getSettings(); // تحميل الإعدادات الافتراضية عند عدم تحديد مستخدم
        }

        document.getElementById('settings-user-key').value = settings.userKey || userKey || '';
        document.getElementById('settings-trial-version').checked = settings.isTrial || false;
        document.getElementById('settings-signature-type').value = settings.signatureType;
        document.getElementById('settings-captain-name').value = settings.captainName;
        document.getElementById('settings-whatsapp-number').value = settings.whatsappNumber;
        document.getElementById('settings-whatsapp-message').value = settings.whatsappMessage;
        document.getElementById('settings-img-banner').value = settings.imgBanner;
        document.getElementById('settings-img-sig1').value = settings.imgSig1;
        document.getElementById('settings-img-sig2').value = settings.imgSig2;
        document.getElementById('settings-img-logo').value = settings.imgLogo;
    };

    /**
     * يجلب الإعدادات المحفوظة مع قيم افتراضية.
     */
    const getSettings = () => {
        // 1. تحقق من وجود مفتاح مستخدم في رابط الصفحة الحالي
        const urlParams = new URLSearchParams(window.location.search);
        const userKey = urlParams.get('user');

        // 2. إذا وجد مفتاح، حاول جلب إعداداته
        if (userKey) {
            const allUserSettings = JSON.parse(localStorage.getItem('dietPlanUserProfiles') || '{}');
            if (allUserSettings[userKey]) {
                return allUserSettings[userKey];
            }
        }

        // 3. في حالة عدم وجود مفتاح أو عدم العثور على إعدادات، ارجع للقيم الافتراضية
        const defaults = {
            isTrial: false,
            signatureType: 'standard', // standard | logo-only
            captainName: 'K/M Mohy',
            whatsappNumber: '201099156738',
            whatsappMessage: 'أهلاً كابتن، لدي استفسار بخصوص الخطة.',
            imgBanner: 'https://i.postimg.cc/mrLC1DL4/Picsart-25-11-15-02-40-50-432.jpg',
            imgSig1: 'https://i.postimg.cc/qBSSTt0g/Picsart-25-11-15-02-41-25-060.jpg',
            imgSig2: 'https://i.postimg.cc/L8MWJrJf/Picsart-25-11-15-02-42-03-732.jpg',
            imgLogo: 'https://i.postimg.cc/L8MWJrJf/Picsart-25-11-15-02-42-03-732.jpg' // رابط افتراضي للوجو
        };

        return defaults;
    };

    /**
     * ينسخ رابط المستخدم المخصص إلى الحافظة.
     */
    const copyUserLink = () => {
        const userKeyInput = document.getElementById('settings-user-key');
        const userKey = userKeyInput.value.trim();

        if (!userKey) {
            alert('الرجاء إدخال "مفتاح المستخدم" أولاً قبل نسخ الرابط.');
            return;
        }

        // الحصول على رابط الصفحة الحالي بدون أي بارامترات أو هاش
        const baseUrl = window.location.origin + window.location.pathname;
        
        // إنشاء الرابط الكامل
        const shareableLink = `${baseUrl}?user=${userKey}`;

        // نسخ الرابط إلى الحافظة
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert(`تم نسخ الرابط بنجاح:\n${shareableLink}`);
        }).catch(err => {
            console.error('فشل في نسخ الرابط: ', err);
            alert('عذراً، حدث خطأ أثناء محاولة نسخ الرابط.');
        });
    };

    /**
     * يعرض النافذة المنبثقة للترقية.
     */
    const showUpgradeModal = () => {
        if (!upgradeModal) return;
        upgradeModal.style.display = 'flex';
        setTimeout(() => {
            const modalContent = upgradeModal.querySelector('div');
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    };



    /**
     * يتحقق من كلمة المرور ويفتح نافذة الإعدادات.
     */
    const openAdminSettings = () => {
        const ADMIN_PASSWORD = 'Botta12@';
        const inputPassword = prompt("يرجى إدخال كلمة مرور لوحة التحكم (ADMIN):");
        if (inputPassword === null) return; // المستخدم ألغى الإدخال

        if (inputPassword === ADMIN_PASSWORD) {
            alert("تم التحقق بنجاح. أهلاً بك في لوحة التحكم.");
            loadSettings(); // تحميل آخر إعدادات تم استخدامها أو الافتراضية
            settingsModal.style.display = 'block';
        } else {
            alert("كلمة المرور غير صحيحة. تم رفض الوصول.");
        }
    };

    // --- التهيئة الأولية للصفحة ---
    populateNutritionFields(); // إنشاء صناديق اختيار الحقول الغذائية

    // --- منطق التحميل الأولي بناءً على الرابط ---
    const urlParamsOnInit = new URLSearchParams(window.location.search);
    const userKeyFromUrl = urlParamsOnInit.get('user');

    // التحقق من وجود مفتاح مستخدم في الرابط
    if (!userKeyFromUrl) {
        // إذا لم يتم توفير مفتاح مستخدم في الرابط، يتم حظر الوصول
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: 'Cairo', sans-serif; color: #333;">
                <h1>الوصول مرفوض</h1>
                <p>هذا الرابط غير صالح. يرجى استخدام الرابط المخصص الذي تم إرساله إليك.</p>
            </div>
        `;
        return; // إيقاف تنفيذ باقي الكود
    }

    // التحقق إذا كان المستخدم هو المدير (ADMIN)
    if (userKeyFromUrl.toLowerCase() !== 'botta12345@') {
        // إذا لم يكن المستخدم هو المدير، يتم تفعيل وضع العميل
        if (settingsButton) {
            settingsButton.style.display = 'none'; // إخفاء زر الإعدادات
        }
    }

    updateUIForPlanType(); // تحديث الواجهة بعد تحديد الوضع

    // ربط أحداث نافذة الإعدادات
    if (settingsButton) settingsButton.addEventListener('click', openAdminSettings);
    if (closeSettingsButton) closeSettingsButton.addEventListener('click', () => settingsModal.style.display = 'none');
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('copy-user-link-btn').addEventListener('click', copyUserLink);
    // تحميل الإعدادات تلقائيا عند تغيير مفتاح المستخدم
    document.getElementById('settings-user-key').addEventListener('input', (e) => {
        const userKey = e.target.value.trim().toLowerCase(); // تحويل المفتاح إلى أحرف صغيرة لتوحيد البحث
        if (userKey) {
            loadSettings(userKey);
        }
    });

    // ربط أحداث نافذة الترقية
    if (closeUpgradeModal) closeUpgradeModal.addEventListener('click', () => upgradeModal.style.display = 'none');
    if (upgradeWhatsappBtn) upgradeWhatsappBtn.addEventListener('click', () => {
        upgradeModal.style.display = 'none'; // إخفاء النافذة عند النقر
        const settings = getSettings();
        const urlParams = new URLSearchParams(window.location.search);
        const userKey = urlParams.get('user');
        const message = `أهلاً كابتن، أرغب في ترقية حسابي إلى النسخة الكاملة.\n(المستخدم: ${userKey || 'غير محدد'})`;

        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });

    // ربط الأحداث بالأزرار الرئيسية
    if (addDayButton) {
        addDayButton.addEventListener('click', addDay);
    }
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', deleteAllDays);
    }
    if (saveButton) {
        saveButton.addEventListener('click', savePlanAsHtml);
    }
    if (loadPlanButton) {
        loadPlanButton.addEventListener('click', () => planFileInput.click()); // فتح نافذة اختيار الملف
    }
    if (planFileInput) {
        planFileInput.addEventListener('change', loadPlanFromFile);
    }
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }
    if (planTypeSelector) {
        planTypeSelector.addEventListener('change', updateUIForPlanType);
    }

    /**
     * استخدام تفويض الأحداث للتعامل مع الأزرار الديناميكية (إضافة وجبة، حذف وجبة، حذف يوم).
     */
    if (daysContainer) {
        daysContainer.addEventListener('click', (event) => {
            const target = event.target;

            // الحالة 1: الضغط على زر "إضافة وجبة"
            if (target.classList.contains('add-meal-btn')) {
                // ابحث عن حاوية الوجبات الأقرب لهذا الزر
                const settings = getSettings();
                const mealsContainer = target.closest('.day-block')?.querySelector('.meals-container');
                if (mealsContainer) {
                    if (settings.isTrial && mealsContainer.children.length >= 3) {
                        showUpgradeModal();
                        return;
                    }
                    mealsContainer.appendChild(createMealBlock());
                }
            }

            // الحالة 2: الضغط على زر "حذف اليوم"
            if (target.classList.contains('delete-day-btn')) {
                const dayBlock = target.closest('.day-block');
                if (dayBlock && confirm('هل أنت متأكد من حذف هذا اليوم بالكامل؟')) {
                    dayBlock.remove();
                    // ملاحظة: لا نعيد ترتيب أرقام الأيام الأخرى للحفاظ على البساطة
                }
            }

            // الحالة 3: الضغط على زر "حذف الوجبة"
            // يجب التأكد من أننا نضغط على الزر نفسه أو الأيقونة بداخله
            const deleteMealButton = target.closest('.delete-meal-btn');
            if (deleteMealButton) {
                const mealBlock = deleteMealButton.closest('.meal-block');
                if (mealBlock) {
                    // لا نطلب تأكيدًا لحذف وجبة واحدة لسرعة الاستخدام
                    mealBlock.remove();
                }
            }
        });

        // قائمة بالنصوص الافتراضية التي سيتم مسحها عند التركيز عليها
        const defaultPlaceholders = [
            'عنوان الوجبة',
            'اسم التمرين',
            'أدخل تفاصيل الوجبة...',
            'أدخل ملاحظات التمرين...'
        ];

        // تحسين تجربة التعديل: مسح النص عند التركيز وإعادته إذا كان فارغًا
        daysContainer.addEventListener('focusin', (event) => {
            const target = event.target;
            const currentText = target.textContent.trim();
            const isDefaultText = defaultPlaceholders.includes(currentText) || /^اليوم \d+$/.test(currentText);

            // فقط إذا كان النص هو أحد النصوص الافتراضية، قم بتفعيل ميزة المسح
            if (target.isContentEditable && isDefaultText && !target.hasAttribute('data-original-text')) {
                target.setAttribute('data-original-text', target.textContent); // حفظ النص الأصلي
                target.textContent = ''; // مسح الحقل
            }
        });

        daysContainer.addEventListener('focusout', (event) => { // focusout يعمل بشكل أفضل من blur مع تفويض الأحداث
            const target = event.target;
            if (target.isContentEditable && target.hasAttribute('data-original-text')) {
                // إذا كان الحقل فارغًا عند الخروج منه، استعد القيمة الأصلية
                if (target.textContent.trim() === '') {
                    target.textContent = target.getAttribute('data-original-text');
                }
                // إزالة السمة المؤقتة
                target.removeAttribute('data-original-text');
            }
        });
    }
});