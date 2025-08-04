// Apply theme immediately to prevent flash
(function () {
    const savedTheme = localStorage.getItem('prospecta_theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    console.log(`🎨 Tema aplicado imediatamente: ${savedTheme}`);
})();

// Global state - Updated for better page management
let selectedProspects = new Set();
let filteredProspects = [];
let allProspects = [];
let searchInProgress = false;
let searchResults = [];

let currentPageProspects = []; // Current page data before filters
let currentFilters = {
    whatsapp: '',
    rating: '',
    search: ''
};

// Debug mode state
let debugMode = false;

// Pagination state - Updated for better page management
let currentPage = 1;
let currentSearchTerm = '';
let searchCoordinates = null;
let hasMoreResults = false;
let pagesData = {}; // Store data for each page
let totalPagesLoaded = 0;

// Map state
let miniMap = null;
let mapMarkers = [];
let currentMapView = 'street';

// API Configuration
const SERPAPI_CONFIG = {
    baseUrl: 'https://serpapi.com/search',
    apiKey: '',
    engine: 'google_maps',
    corsProxies: [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/'
    ]
};

// WhatsApp Validation API Configuration
const WHATSAPP_API_CONFIG = {
    baseUrl: '',
    instance: '',
    endpoint: '/chat/whatsappNumbers/',
    apiKey: '',
    authHeader: 'apikey'
};

// Debug logging function
function debugLog(message, data = null) {
    if (!debugMode) return;

    const timestamp = new Date().toISOString();
    const verbose = true;

    if (verbose) {
        if (data) {
            console.log(`🔍 [${timestamp}] ${message}`, data);
        } else {
            console.log(`🔍 [${timestamp}] ${message}`);
        }
    }
}

// Theme functions
function setTheme(theme) {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    html.setAttribute('data-bs-theme', theme);

    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon';
        } else {
            themeIcon.className = 'bi bi-sun';
        }
    }

    localStorage.setItem('prospecta_theme', theme);
    debugLog(`Tema alterado para: ${theme}`);
}

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('prospecta_theme') || 'dark';
    const themeIcon = document.getElementById('theme-icon');

    debugLog(`Atualizando ícone para tema: ${savedTheme}`);

    if (themeIcon) {
        if (savedTheme === 'dark') {
            themeIcon.className = 'bi bi-moon';
        } else {
            themeIcon.className = 'bi bi-sun';
        }
    }

    document.documentElement.setAttribute('data-bs-theme', savedTheme);
}

function toggleTheme() {
    const html = document.documentElement;

    if (html.getAttribute('data-bs-theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Initialize
function init() {
    updateCounts();
    loadAllConfigs();
    loadThemeFromStorage();
    updateSearchButtonState();
    initializeMap();
    showWelcomeMessage();
    debugLog('Sistema inicializado');
}

function showWelcomeMessage() {
    const container = document.getElementById('prospects-container');
    const emptyState = document.getElementById('empty-state');

    if (container && emptyState) {
        container.classList.add('d-none');
        emptyState.classList.remove('d-none');

        emptyState.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-rocket-takeoff fs-1 text-primary mb-3"></i>
                <h4 class="text-primary mb-3">Bem-vindo ao Prospecta PRO!</h4>
                <p class="text-muted mb-4">
                    Encontre leads qualificados de forma automatizada.<br>
                    Busque empresas, valide WhatsApp e exporte dados em Excel.
                </p>
                <div class="alert alert-info d-inline-block">
                    <i class="bi bi-gear me-2"></i>
                    <strong>Primeiro passo:</strong> Configure suas APIs clicando no ícone da engrenagem <i class="bi bi-gear"></i> no canto superior direito.
                </div>
                <div class="mt-4">
                    <button class="btn btn-primary me-2" onclick="showConfigModal()">
                        <i class="bi bi-gear me-2"></i>Configurar APIs
                    </button>
                </div>
            </div>
        `;
    }
}

function updateSearchButtonState() {
    const searchBtn = document.querySelector('.btn.gradient-bg, .btn-secondary');
    const searchBtnText = document.getElementById('search-btn-text');

    if (!searchBtn || !searchBtnText) {
        debugLog('Botão de busca não encontrado para atualizar');
        return;
    }

    const isConfigured = SERPAPI_CONFIG.apiKey &&
        WHATSAPP_API_CONFIG.baseUrl &&
        WHATSAPP_API_CONFIG.instance &&
        WHATSAPP_API_CONFIG.apiKey;

    debugLog('Verificando configurações:', {
        serpapi: !!SERPAPI_CONFIG.apiKey,
        whatsapp_base: !!WHATSAPP_API_CONFIG.baseUrl,
        whatsapp_instance: !!WHATSAPP_API_CONFIG.instance,
        whatsapp_key: !!WHATSAPP_API_CONFIG.apiKey,
        isConfigured: isConfigured
    });

    if (isConfigured) {
        searchBtn.disabled = false;
        searchBtn.classList.remove('btn-secondary');
        searchBtn.classList.add('gradient-bg', 'text-white');
        searchBtn.title = '';
        searchBtnText.innerHTML = '<i class="bi bi-search me-2"></i>Buscar';
        debugLog('Botão de busca habilitado');
    } else {
        searchBtn.disabled = true;
        searchBtn.classList.remove('gradient-bg', 'text-white');
        searchBtn.classList.add('btn-secondary');
        searchBtn.title = 'Configure as APIs primeiro! Clique na engrenagem.';
        searchBtnText.innerHTML = '<i class="bi bi-gear me-2"></i>Configure APIs';
        debugLog('Botão de busca desabilitado - configurações incompletas');
    }
}

// FUNÇÃO CORRIGIDA: Apply filters to current page data only
function applyFiltersToCurrentPage() {
    console.log('🔧 INICIANDO applyFiltersToCurrentPage');
    console.log('🔧 currentPageProspects:', currentPageProspects.length);
    console.log('🔧 currentFilters:', currentFilters);

    let filtered = [...currentPageProspects];
    console.log('🔧 Cópia inicial:', filtered.length);

    // Apply search filter
    if (currentFilters.search && currentFilters.search.trim() !== '') {
        const searchTerm = currentFilters.search.toLowerCase();
        const beforeSearch = filtered.length;
        filtered = filtered.filter(prospect =>
            prospect.name.toLowerCase().includes(searchTerm) ||
            prospect.endereco.toLowerCase().includes(searchTerm) ||
            (prospect.category && prospect.category.toLowerCase().includes(searchTerm)) ||
            (prospect.types && prospect.types.toLowerCase().includes(searchTerm))
        );
        console.log(`🔧 Após filtro de busca "${searchTerm}": ${beforeSearch} → ${filtered.length}`);
    }

    // Apply WhatsApp filter - CORREÇÃO AQUI!
    if (currentFilters.whatsapp !== '') {
        const beforeWhatsApp = filtered.length;
        if (currentFilters.whatsapp === 'true') {
            // Apenas com WhatsApp
            filtered = filtered.filter(p => p.hasWhatsApp === true);
            console.log(`🔧 Filtro "Apenas com WhatsApp": ${beforeWhatsApp} → ${filtered.length}`);
        } else if (currentFilters.whatsapp === 'false') {
            // Apenas sem WhatsApp
            filtered = filtered.filter(p => p.hasWhatsApp === false);
            console.log(`🔧 Filtro "Sem WhatsApp": ${beforeWhatsApp} → ${filtered.length}`);
        }
        // Se currentFilters.whatsapp === '', não aplica filtro (mostra todos)
    }

    // Apply rating filter
    if (currentFilters.rating !== '') {
        const beforeRating = filtered.length;
        filtered = filtered.filter(p => (p.rating || 0) >= parseFloat(currentFilters.rating));
        console.log(`🔧 Após filtro rating "${currentFilters.rating}": ${beforeRating} → ${filtered.length}`);
    }

    filteredProspects = filtered;
    console.log(`🔧 RESULTADO FINAL: ${currentPageProspects.length} → ${filteredProspects.length} prospects`);

    // Update filter status display
    updateFilterStatus();
}

// NEW FUNCTION: Update filter status display
function updateFilterStatus() {
    const filterStatus = document.getElementById('filter-status');
    const filterDescription = document.getElementById('filter-description');

    const activeFilters = [];

    if (currentFilters.search && currentFilters.search.trim() !== '') {
        activeFilters.push(`Busca: "${currentFilters.search}"`);
    }

    if (currentFilters.whatsapp === 'true') {
        activeFilters.push('Apenas com WhatsApp');
    } else if (currentFilters.whatsapp === 'false') {
        activeFilters.push('Sem WhatsApp');
    }

    if (currentFilters.rating !== '') {
        activeFilters.push(`Rating ${currentFilters.rating}+ estrelas`);
    }

    if (activeFilters.length > 0) {
        filterStatus.classList.remove('d-none');
        filterDescription.textContent = `Filtros ativos: ${activeFilters.join(', ')}`;
    } else {
        filterStatus.classList.add('d-none');
    }
}

// Search prospects using improved debug approach
async function searchProspects(pageNum = 1) {
    debugLog('=== INICIANDO BUSCA DE PROSPECTS ===');
    debugLog(`Página: ${pageNum}`);

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn-text');
    const spinner = document.querySelector('.loading-spinner');
    const paginationControls = document.getElementById('pagination-controls');

    if (!searchInput || !searchBtn || !spinner) {
        console.error('Elementos da interface não encontrados');
        return;
    }

    // Check if APIs are configured
    if (!SERPAPI_CONFIG.apiKey || !WHATSAPP_API_CONFIG.baseUrl || !WHATSAPP_API_CONFIG.instance || !WHATSAPP_API_CONFIG.apiKey) {
        showErrorToast('❌ Configure as APIs primeiro! Clique na engrenagem para configurar.');
        return;
    }

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        showErrorToast('Por favor, digite um termo de busca');
        return;
    }

    // If it's a new search (page 1), reset pagination state
    if (pageNum === 1) {
        currentSearchTerm = searchTerm;
        currentFilters.search = '';
        searchCoordinates = null;
        currentPage = 1;
        allProspects = [];
        selectedProspects.clear();
        pagesData = {}; // Clear stored pages
        totalPagesLoaded = 0;

        // Reset filters and UI
        currentFilters = {
            whatsapp: '',
            rating: '',
            search: ''
        };

        // Limpar campos visuais dos filtros
        const whatsappFilter = document.getElementById('whatsapp-filter');
        const ratingFilter = document.getElementById('rating-filter');
        if (whatsappFilter) whatsappFilter.value = '';
        if (ratingFilter) ratingFilter.value = '';

        debugLog('Nova busca iniciada - estado resetado');
    }

    // Show loading
    spinner.style.display = 'inline-block';
    searchBtn.innerHTML = pageNum === 1 ? 'Buscando...' : `Carregando página ${pageNum}...`;

    try {
        // Step 1: Search with SerpAPI
        debugLog('=== ETAPA 1: BUSCANDO NA SERPAPI ===');
        const apiResponse = await callSerpAPI(searchTerm, pageNum);
        const results = apiResponse.results || [];
        debugLog(`SerpAPI retornou: ${results.length} resultados`);

        // Store coordinates from first search for pagination
        if (pageNum === 1 && apiResponse.coordinates) {
            searchCoordinates = apiResponse.coordinates;
            debugLog('Coordenadas salvas para paginação:', searchCoordinates);
        }

        // Update pagination state
        hasMoreResults = apiResponse.hasMore || false;
        currentPage = pageNum;

        if (results && results.length > 0) {
            // Step 2: Extract phone numbers
            debugLog('=== ETAPA 2: EXTRAINDO TELEFONES ===');
            const phoneNumbers = extractPhoneNumbers(results);
            debugLog(`Números extraídos: ${phoneNumbers.length}`, phoneNumbers);

            // Step 3: Validate WhatsApp
            debugLog('=== ETAPA 3: VALIDANDO WHATSAPP ===');
            searchBtn.innerHTML = 'Validando WhatsApp...';
            const whatsappValidation = await validateWhatsAppNumbers(phoneNumbers);
            debugLog('Validação WhatsApp concluída');

            // Step 4: Process results
            debugLog('=== ETAPA 4: PROCESSANDO RESULTADOS FINAIS ===');
            const processedResults = processResults(results, whatsappValidation);

            // Store current page data
            pagesData[pageNum] = processedResults;
            totalPagesLoaded = Math.max(totalPagesLoaded, pageNum);

            // Update current page display
            currentPage = pageNum;
            currentPageProspects = processedResults;

            console.log('🔧 Dados processados:', processedResults.length);
            console.log('🔧 currentPageProspects atribuído:', currentPageProspects.length);
            console.log('🔧 Primeiro prospect:', processedResults[0]);

            // Apply current filters to the new page data
            applyFiltersToCurrentPage();

            // Update allProspects for statistics (all loaded pages combined)
            allProspects = [];
            for (let i = 1; i <= totalPagesLoaded; i++) {
                if (pagesData[i]) {
                    allProspects = [...allProspects, ...pagesData[i]];
                }
            }

            loadProspects();
            updatePaginationControls();
            updateMapMarkers();

            // Show pagination controls
            paginationControls.classList.remove('d-none');

            const totalFound = pageNum === 1 ? results.length : allProspects.length;
            showSuccessToast(`🎉 ${pageNum === 1 ? 'Encontrados' : 'Carregados'} ${results.length} novos prospects${pageNum > 1 ? ` (Total: ${totalFound})` : ''}`);

            debugLog('=== BUSCA CONCLUÍDA COM SUCESSO ===');
        } else {
            if (pageNum === 1) {
                showErrorToast('Nenhum resultado encontrado. Tente outros termos de busca.');
                paginationControls.classList.add('d-none');
            } else {
                showErrorToast('Não há mais resultados disponíveis.');
            }
        }

    } catch (error) {
        console.error('Erro na busca:', error);
        debugLog('=== ERRO NA BUSCA ===', error);
        showErrorToast(`Erro ao buscar prospects: ${error.message}`);

        if (pageNum === 1) {
            paginationControls.classList.add('d-none');
        }
    } finally {
        // Hide loading
        spinner.style.display = 'none';
        searchBtn.innerHTML = '<i class="bi bi-search me-2"></i>Buscar';
    }

    debugLog('=== BUSCA CONCLUÍDA COM SUCESSO ===');
    debugLog('Dados finais:', {
        currentPageProspects: currentPageProspects.length,
        filteredProspects: filteredProspects.length,
        allProspects: allProspects.length
    });
}

// Extract phone numbers from results (improved from debug version)
function extractPhoneNumbers(results) {
    debugLog('Extraindo números de telefone...');

    const phoneNumbers = [];
    const phoneSet = new Set(); // Para evitar duplicatas

    results.forEach((result, index) => {
        const phoneField = result.telefone || result.phone;
        debugLog(`[${index + 1}] ${result.name || result.title}:`);
        debugLog(`   Telefone original: "${phoneField}"`);

        if (!phoneField || phoneField === 'Telefone não disponível') {
            debugLog(`   ❌ Sem telefone válido`);
            return;
        }

        // Clean phone number
        const cleanPhone = phoneField.replace(/\D/g, '');
        debugLog(`   Telefone limpo: "${cleanPhone}"`);
        debugLog(`   Tamanho: ${cleanPhone.length} dígitos`);

        if (cleanPhone.length >= 10) {
            if (!phoneSet.has(cleanPhone)) {
                phoneSet.add(cleanPhone);
                phoneNumbers.push(cleanPhone);
                debugLog(`   ✅ Número válido adicionado`);
            } else {
                debugLog(`   ⚠️ Número duplicado ignorado`);
            }
        } else {
            debugLog(`   ❌ Número muito curto (< 10 dígitos)`);
        }
    });

    debugLog('RESUMO EXTRAÇÃO:', {
        totalProspects: results.length,
        numerosValidos: phoneNumbers.length,
        numerosDuplicados: results.length - phoneNumbers.length,
        listaNumeros: phoneNumbers
    });

    return phoneNumbers;
}

// Validate WhatsApp numbers (improved from debug version)
async function validateWhatsAppNumbers(phoneNumbers) {
    debugLog('=== INÍCIO VALIDAÇÃO WHATSAPP ===');
    debugLog(`Total de números a validar: ${phoneNumbers.length}`, phoneNumbers);

    if (phoneNumbers.length === 0) {
        debugLog('Nenhum número para validar');
        return {};
    }

    const url = `${WHATSAPP_API_CONFIG.baseUrl}${WHATSAPP_API_CONFIG.endpoint}${WHATSAPP_API_CONFIG.instance}`;
    debugLog('URL WhatsApp API:', url);

    const requestBody = { numbers: phoneNumbers };
    debugLog('Request body:', requestBody);

    const headers = {
        'Content-Type': 'application/json',
        [WHATSAPP_API_CONFIG.authHeader]: WHATSAPP_API_CONFIG.apiKey
    };
    debugLog('Headers (API key oculta):', { ...headers, [WHATSAPP_API_CONFIG.authHeader]: '***' });

    debugLog('Enviando requisição...');
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    });

    debugLog(`Status da resposta: ${response.status}`);
    debugLog('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        const errorText = await response.text();
        debugLog('Erro HTTP:', { status: response.status, error: errorText });
        throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    debugLog('Resposta RAW:', responseData);
    debugLog(`Tipo da resposta: ${typeof responseData}, É array: ${Array.isArray(responseData)}`);

    // Process response
    const validationMap = {};

    if (Array.isArray(responseData)) {
        debugLog('Processando resposta como array...');
        debugLog(`Total de itens na resposta: ${responseData.length}`);

        responseData.forEach((item, index) => {
            debugLog(`[${index + 1}] Processando item:`, item);

            if (item.number) {
                const number = item.number.toString();
                const hasWhatsApp = item.exists === true;

                validationMap[number] = {
                    hasWhatsApp: hasWhatsApp,
                    status: hasWhatsApp ? 'verified' : 'no_whatsapp',
                    jid: item.jid || null,
                    rawData: item
                };

                debugLog(`   Número: ${number}`);
                debugLog(`   Exists: ${item.exists} (tipo: ${typeof item.exists})`);
                debugLog(`   Resultado: ${hasWhatsApp ? 'TEM' : 'NÃO TEM'} WhatsApp`);
                debugLog(`   JID: ${item.jid || 'N/A'}`);
            } else {
                debugLog(`   ⚠️ Item sem propriedade 'number':`, item);
            }
        });
    } else {
        debugLog('⚠️ Resposta não é array:', responseData);
        throw new Error('Formato de resposta não reconhecido');
    }

    const withWhatsApp = Object.values(validationMap).filter(v => v.hasWhatsApp).length;
    const withoutWhatsApp = Object.values(validationMap).filter(v => !v.hasWhatsApp).length;
    debugLog('=== RESUMO VALIDAÇÃO WHATSAPP ===', {
        totalProcessados: Object.keys(validationMap).length,
        comWhatsApp: withWhatsApp,
        semWhatsApp: withoutWhatsApp
    });

    Object.entries(validationMap).forEach(([number, data]) => {
        debugLog(`${number}: ${data.hasWhatsApp ? '✅ TEM' : '❌ NÃO TEM'} WhatsApp`);
    });

    debugLog('=== FIM VALIDAÇÃO WHATSAPP ===');

    return validationMap;
}

// Process final results (improved from debug version)
function processResults(serpResults, whatsappValidation) {
    debugLog('=== PROCESSANDO RESULTADOS FINAIS ===');
    debugLog(`Prospects SerpAPI: ${serpResults.length}`);
    debugLog(`Validações WhatsApp: ${Object.keys(whatsappValidation).length}`);

    const processedResults = serpResults.map((prospect, index) => {
        debugLog(`[${index + 1}] Processando: ${prospect.title || prospect.name}`);

        const originalPhone = prospect.phone || prospect.telefone;
        const cleanPhone = originalPhone ? originalPhone.replace(/\D/g, '') : null;

        debugLog(`   Telefone original: "${originalPhone}"`);
        debugLog(`   Telefone limpo: "${cleanPhone}"`);

        let whatsappData = null;
        if (cleanPhone && whatsappValidation[cleanPhone]) {
            whatsappData = whatsappValidation[cleanPhone];
            debugLog(`   Encontrado na validação:`, whatsappData);
        } else {
            debugLog(`   NÃO encontrado na validação`);
        }

        const hasWhatsApp = whatsappData ? whatsappData.hasWhatsApp : false;
        const status = whatsappData ? whatsappData.status : 'unknown';

        debugLog(`   Resultado final: ${hasWhatsApp ? 'TEM' : 'NÃO TEM'} WhatsApp (status: ${status})`);

        return {
            id: Date.now() + index,
            name: prospect.title || prospect.name || 'Nome não disponível',
            endereco: prospect.address || prospect.endereco || 'Endereço não disponível',
            telefone: originalPhone || 'Telefone não disponível',
            email: prospect.email || null,
            rating: prospect.rating || 0,
            reviews: prospect.reviews || 0,
            website: prospect.website || null,
            types: prospect.type ? (Array.isArray(prospect.type) ? prospect.type.join(', ') : prospect.type) : 'Categoria não disponível',
            hasWhatsApp: hasWhatsApp,
            status: status,
            category: extractMainCategory(prospect.type || prospect.types || ''),
            place_id: prospect.place_id || null,
            gps_coordinates: prospect.gps_coordinates || null,
            whatsappJid: whatsappData ? whatsappData.jid : null,
            debugInfo: debugMode ? {
                originalPhone: originalPhone,
                cleanPhone: cleanPhone,
                whatsappData: whatsappData,
                processed: true
            } : null
        };
    });

    const withWhatsApp = processedResults.filter(p => p.hasWhatsApp).length;
    const withoutWhatsApp = processedResults.filter(p => !p.hasWhatsApp).length;
    debugLog('=== RESUMO PROCESSAMENTO ===', {
        resultadoFinal: `${withWhatsApp} com WhatsApp, ${withoutWhatsApp} sem WhatsApp`
    });

    return processedResults;
}

// Extract main category from types
function extractMainCategory(types) {
    if (!types) return 'Outros';

    const typesList = types.toLowerCase();

    if (typesList.includes('dental') || typesList.includes('dentist')) return 'Dentista';
    if (typesList.includes('pet')) return 'Pet Shop';
    if (typesList.includes('restaurant')) return 'Restaurante';
    if (typesList.includes('store')) return 'Loja';
    if (typesList.includes('hospital')) return 'Hospital';
    if (typesList.includes('school')) return 'Escola';
    if (typesList.includes('hotel')) return 'Hotel';
    if (typesList.includes('clinic')) return 'Clínica';
    if (typesList.includes('pharmacy')) return 'Farmácia';
    if (typesList.includes('bank')) return 'Banco';

    return 'Outros';
}

// Call SerpAPI with improved error handling
async function callSerpAPI(searchTerm, pageNum = 1) {
    debugLog(`Chamando SerpAPI - Página ${pageNum} - Termo: ${searchTerm}`);

    const resultsLimitInput = document.getElementById('results-limit');
    const resultsLimit = resultsLimitInput ? (resultsLimitInput.value || 20) : 20;

    const startPosition = (pageNum - 1) * parseInt(resultsLimit);

    const params = new URLSearchParams({
        engine: SERPAPI_CONFIG.engine,
        q: searchTerm,
        api_key: SERPAPI_CONFIG.apiKey,
        hl: 'pt',
        gl: 'br',
        num: resultsLimit.toString()
    });

    if (pageNum > 1) {
        params.append('start', startPosition.toString());

        if (searchCoordinates && searchCoordinates.lat && searchCoordinates.lng) {
            const lat = parseFloat(searchCoordinates.lat);
            const lng = parseFloat(searchCoordinates.lng);

            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                params.append('ll', `@${lat.toFixed(6)},${lng.toFixed(6)},12z`);
                debugLog('Usando coordenadas salvas para paginação:', `@${lat.toFixed(6)},${lng.toFixed(6)},12z`);
            }
        }
    }

    const serpApiUrl = `${SERPAPI_CONFIG.baseUrl}?${params}`;
    debugLog('URL SerpAPI:', serpApiUrl);
    debugLog(`Página: ${pageNum}, Start: ${startPosition}, Limite: ${resultsLimit}`);

    // Try multiple proxies with better error handling
    for (let i = 0; i < SERPAPI_CONFIG.corsProxies.length; i++) {
        const proxy = SERPAPI_CONFIG.corsProxies[i];
        let proxiedUrl;

        if (proxy.includes('codetabs')) {
            proxiedUrl = proxy + encodeURIComponent(serpApiUrl);
        } else if (proxy.includes('allorigins')) {
            proxiedUrl = proxy + encodeURIComponent(serpApiUrl);
        } else {
            proxiedUrl = proxy + serpApiUrl;
        }

        try {
            debugLog(`Tentando proxy ${i + 1}: ${proxy}`);

            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            debugLog(`Status da resposta proxy: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Proxy error! status: ${response.status}`);
            }

            const proxyData = await response.json();
            debugLog('Resposta do proxy recebida:', typeof proxyData);

            let serpApiData;
            try {
                if (proxy.includes('allorigins')) {
                    if (!proxyData.contents) {
                        throw new Error('Proxy retornou dados vazios');
                    }
                    serpApiData = JSON.parse(proxyData.contents);
                } else if (proxy.includes('codetabs')) {
                    serpApiData = proxyData;
                } else {
                    serpApiData = proxyData;
                }
            } catch (parseError) {
                debugLog('Erro ao fazer parse da resposta:', parseError);
                throw new Error(`Erro ao processar resposta: ${parseError.message}`);
            }

            debugLog('Dados SerpAPI processados:', Object.keys(serpApiData));

            if (serpApiData.error) {
                debugLog('Erro SerpAPI:', serpApiData.error);
                throw new Error(`SerpAPI Error: ${serpApiData.error}`);
            }

            // Extract coordinates from first page for future pagination
            let coordinates = null;
            if (pageNum === 1 && serpApiData.search_parameters) {
                if (serpApiData.search_metadata && serpApiData.search_metadata.google_maps_url) {
                    coordinates = extractCoordinatesFromUrl(serpApiData.search_metadata.google_maps_url);
                }

                if (!coordinates && serpApiData.local_results && serpApiData.local_results[0]) {
                    const firstResult = serpApiData.local_results[0];
                    if (firstResult.gps_coordinates) {
                        coordinates = {
                            lat: firstResult.gps_coordinates.latitude,
                            lng: firstResult.gps_coordinates.longitude
                        };
                    }
                }
            }

            if (serpApiData.local_results && Array.isArray(serpApiData.local_results)) {
                debugLog(`Encontrados ${serpApiData.local_results.length} resultados locais na página ${pageNum}`);

                const transformedResults = serpApiData.local_results.map((result, index) => ({
                    id: Date.now() + index,
                    name: result.title || 'Nome não disponível',
                    title: result.title || 'Nome não disponível',
                    endereco: result.address || 'Endereço não disponível',
                    address: result.address || 'Endereço não disponível',
                    telefone: result.phone || 'Telefone não disponível',
                    phone: result.phone || 'Telefone não disponível',
                    rating: result.rating || 0,
                    reviews: result.reviews || 0,
                    website: result.website || null,
                    types: result.type ? (Array.isArray(result.type) ? result.type.join(', ') : result.type) : 'Categoria não disponível',
                    type: result.type || 'Categoria não disponível',
                    place_id: result.place_id || null,
                    gps_coordinates: result.gps_coordinates || null
                }));

                const hasMore = serpApiData.local_results.length === parseInt(resultsLimit);

                return {
                    results: transformedResults,
                    coordinates: coordinates,
                    hasMore: hasMore,
                    totalResults: serpApiData.search_information?.total_results || null
                };
            } else {
                debugLog('Nenhum local_results encontrado na resposta');
                debugLog('Estrutura da resposta SerpAPI:', Object.keys(serpApiData));

                return {
                    results: [],
                    coordinates: coordinates,
                    hasMore: false,
                    totalResults: 0
                };
            }

        } catch (error) {
            debugLog(`Erro no proxy ${i + 1}:`, error.message);

            if (i < SERPAPI_CONFIG.corsProxies.length - 1) {
                debugLog('Tentando próximo proxy...');
                continue;
            } else {
                throw error;
            }
        }
    }

    throw new Error('Todos os proxies CORS falharam. Verifique sua conexão.');
}

// Extract coordinates from Google Maps URL
function extractCoordinatesFromUrl(url) {
    try {
        const patterns = [
            /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
            /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
            /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);

                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    return { lat: lat, lng: lng };
                }
            }
        }

        return null;
    } catch (error) {
        debugLog('Erro ao extrair coordenadas da URL:', error);
        return null;
    }
}

// Load next page - Improved with cache check
async function loadNextPage() {
    if (!hasMoreResults || searchInProgress) return;

    const nextPage = currentPage + 1;

    // Check if we already have data for the next page
    if (pagesData[nextPage]) {
        debugLog(`Página ${nextPage} já está em cache, carregando localmente`);
        currentPage = nextPage;
        currentPageProspects = pagesData[nextPage];

        applyFiltersToCurrentPage();
        loadProspects();
        updatePaginationControls();
        updateMapMarkers();

        showSuccessToast(`📄 Página ${currentPage} carregada (cache)`);
        return;
    }

    // Load new page from API
    debugLog(`Carregando nova página ${nextPage} da API`);
    searchInProgress = true;
    await searchProspects(nextPage);
    searchInProgress = false;
}

// Load previous page - Now implemented
function loadPreviousPage() {
    if (currentPage <= 1 || searchInProgress) return;

    const previousPage = currentPage - 1;

    if (pagesData[previousPage]) {
        debugLog(`Navegando para página ${previousPage} (cache)`);
        currentPage = previousPage;
        currentPageProspects = pagesData[previousPage];

        applyFiltersToCurrentPage();
        loadProspects();
        updatePaginationControls();
        updateMapMarkers();

        showSuccessToast(`📄 Página ${currentPage} carregada`);
    } else {
        showErrorToast('❌ Dados da página anterior não disponíveis. Use uma nova busca.');
        debugLog(`Dados da página ${previousPage} não encontrados`);
    }
}

// Update pagination controls
function updatePaginationControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const showingRange = document.getElementById('showing-range');
    const totalAvailable = document.getElementById('total-available');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = !hasMoreResults;
        nextBtn.innerHTML = hasMoreResults ?
            'Próxima <i class="bi bi-chevron-right"></i>' :
            'Fim dos resultados';
    }

    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage}`;
    }

    const currentPageStart = 1;
    const currentPageEnd = filteredProspects.length;

    if (showingRange) {
        showingRange.textContent = `${currentPageStart}-${currentPageEnd}`;
    }

    if (totalAvailable) {
        const totalLoadedSoFar = allProspects.length;
        totalAvailable.textContent = hasMoreResults ? `${totalLoadedSoFar}+` : totalLoadedSoFar.toString();
    }
}

function loadProspects() {
    console.log('🔧 CARREGANDO PROSPECTS - filteredProspects:', filteredProspects.length);

    const container = document.getElementById('prospects-container');
    const emptyState = document.getElementById('empty-state');

    if (!container || !emptyState) {
        console.log('❌ Container ou emptyState não encontrados');
        return;
    }

    container.innerHTML = '';

    if (filteredProspects.length === 0) {
        container.classList.add('d-none');
        emptyState.classList.remove('d-none');
        return;
    }

    container.classList.remove('d-none');
    emptyState.classList.add('d-none');

    filteredProspects.forEach(prospect => {
        const prospectElement = createProspectElement(prospect);
        container.appendChild(prospectElement);
    });

    updateCounts();
    updateMapMarkers();
    updateExportButton();
}

// Create prospect element
function createProspectElement(prospect) {
    const div = document.createElement('div');
    div.className = 'col-12';

    const isSelected = selectedProspects.has(prospect.id);
    const formattedPhone = formatPhoneNumber(prospect.telefone);

    div.innerHTML = `
        <div class="card prospect-card fade-in ${isSelected ? 'selected' : ''}" onclick="toggleProspectSelection(${prospect.id})">
            <div class="card-body p-3">
                <div class="row align-items-start">
                    <div class="col-auto">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''} 
                                    onclick="event.stopPropagation()" onchange="toggleProspectSelection(${prospect.id})">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center mb-2">
                                    <h6 class="mb-0 me-2 text-truncate" style="max-width: 300px;" title="${prospect.name}">${prospect.name}</h6>
                                    <div class="d-flex align-items-center gap-1 flex-shrink-0">
                                        ${prospect.hasWhatsApp ?
            '<span class="whatsapp-status bg-success text-white">WhatsApp</span>' :
            '<span class="whatsapp-status bg-danger text-white">Sem WhatsApp</span>'
        }
                                    </div>
                                </div>
                                
                                <div class="small text-muted">
                                    <div class="d-flex align-items-start mb-1">
                                        <i class="bi bi-geo-alt me-2 flex-shrink-0 mt-1"></i>
                                        <span class="text-truncate" title="${prospect.endereco}">${prospect.endereco}</span>
                                    </div>
                                    <div class="d-flex align-items-center mb-1">
                                        <i class="bi bi-telephone me-2 flex-shrink-0"></i>
                                        <span class="me-2">${formattedPhone}</span>
                                        ${prospect.hasWhatsApp ?
            `<a href="https://wa.me/${prospect.telefone.replace(/\D/g, '')}" target="_blank" class="text-success">
                                                <i class="bi bi-whatsapp"></i>
                                            </a>` : ''
        }
                                    </div>
                                    ${prospect.website ? `
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="bi bi-globe me-2 flex-shrink-0"></i>
                                            <a href="${prospect.website}" target="_blank" class="text-decoration-none text-truncate" style="max-width: 250px;">
                                                ${prospect.website}
                                            </a>
                                        </div>
                                    ` : ''}
                                    ${prospect.email ? `
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="bi bi-envelope me-2 flex-shrink-0"></i>
                                            <span class="text-truncate" style="max-width: 250px;" title="${prospect.email}">
                                                ${prospect.email}
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <div class="mb-2">
                                    ${prospect.rating > 0 ? `
                                        <div class="d-flex align-items-center justify-content-md-end">
                                            <div class="rating-stars me-1">
                                                ${generateStars(prospect.rating)}
                                            </div>
                                            <span class="small fw-bold">${prospect.rating}</span>
                                            <span class="small text-muted ms-1">(${prospect.reviews})</span>
                                        </div>
                                    ` : '<span class="small text-muted">Sem avaliações</span>'}
                                </div>
                                <div class="d-flex justify-content-md-end">
                                    <span class="badge bg-primary">${prospect.category || 'Outros'}</span>
                                </div>
                                <div class="mt-2">
                                    <small class="text-muted text-truncate d-block" style="max-width: 200px;" title="${prospect.types}">
                                        <i class="bi bi-tags me-1"></i>${prospect.types}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return div;
}

// Format phone number
function formatPhoneNumber(phone) {
    if (!phone) return 'Não informado';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half"></i>';
        for (let i = fullStars + 1; i < 5; i++) {
            stars += '<i class="bi bi-star"></i>';
        }
    } else {
        for (let i = fullStars; i < 5; i++) {
            stars += '<i class="bi bi-star"></i>';
        }
    }

    return stars;
}

// Toggle prospect selection - Now works across all pages
function toggleProspectSelection(id) {
    if (selectedProspects.has(id)) {
        selectedProspects.delete(id);
        debugLog(`Prospect ${id} desmarcado`);
    } else {
        selectedProspects.add(id);
        debugLog(`Prospect ${id} marcado`);
    }

    loadProspects();
    updateExportButton();

    debugLog(`Total selecionados: ${selectedProspects.size}`);
}

// Select all prospects - Now works for current page only
function selectAll() {
    filteredProspects.forEach(prospect => {
        selectedProspects.add(prospect.id);
    });
    loadProspects();
    updateExportButton();

    showSuccessToast(`✅ ${filteredProspects.length} prospects desta página foram selecionados`);
    debugLog(`Selecionados todos da página atual. Total global: ${selectedProspects.size}`);
}

// Clear selection - Now has option to clear all or just current page
function clearSelection() {
    // Clear only current page selections
    filteredProspects.forEach(prospect => {
        selectedProspects.delete(prospect.id);
    });

    loadProspects();
    updateExportButton();

    showSuccessToast(`🗑️ Seleção da página atual foi limpa`);
    debugLog(`Limpeza da página atual. Total global restante: ${selectedProspects.size}`);
}

// Update counts - Now shows global selections and current page stats
function updateCounts() {
    const selectedCountEl = document.getElementById('selected-count');
    const resultsCountEl = document.getElementById('results-count');
    const whatsappCountEl = document.getElementById('whatsapp-count');
    const noWhatsappCountEl = document.getElementById('no-whatsapp-count');
    const verifiedCountEl = document.getElementById('verified-count');
    const avgRatingEl = document.getElementById('avg-rating');

    // Global selection count
    if (selectedCountEl) selectedCountEl.textContent = selectedProspects.size;

    if (resultsCountEl) {
        const pageText = currentPage > 1 ? ` (Página ${currentPage})` : '';
        const filterText = (currentFilters.whatsapp || currentFilters.rating || currentFilters.search) ? ' (filtrado)' : '';
        resultsCountEl.textContent = `${filteredProspects.length} empresas encontradas${pageText}${filterText}`;
    }

    // Statistics for current page (filtered)
    const whatsappCount = filteredProspects.filter(p => p.hasWhatsApp).length;
    const noWhatsappCount = filteredProspects.filter(p => !p.hasWhatsApp).length;
    const verifiedCount = filteredProspects.filter(p => p.status === 'verified').length;

    const ratingsSum = filteredProspects.reduce((sum, p) => sum + (p.rating || 0), 0);
    const avgRating = filteredProspects.length > 0 ? (ratingsSum / filteredProspects.length).toFixed(1) : '0.0';

    if (whatsappCountEl) whatsappCountEl.textContent = whatsappCount;
    if (noWhatsappCountEl) noWhatsappCountEl.textContent = noWhatsappCount;
    if (verifiedCountEl) verifiedCountEl.textContent = verifiedCount;
    if (avgRatingEl) avgRatingEl.textContent = avgRating;
}

// Update export button
function updateExportButton() {
    const exportBtn = document.getElementById('export-btn');
    const exportCount = document.getElementById('export-count');
    const exportAllBtn = document.getElementById('export-all-btn');
    const exportAllCount = document.getElementById('export-all-count');
    const exportDisparadorBtn = document.getElementById('export-disparador-btn');
    const exportDisparadorCount = document.getElementById('export-disparador-count');

    if (exportCount) exportCount.textContent = selectedProspects.size;

    if (exportBtn) {
        if (selectedProspects.size > 0) {
            exportBtn.disabled = false;
            exportBtn.classList.remove('export-btn');
        } else {
            exportBtn.disabled = true;
            exportBtn.classList.add('export-btn');
        }
    }

    if (exportAllBtn && exportAllCount) {
        exportAllCount.textContent = allProspects.length;

        if (allProspects.length > 0) {
            exportAllBtn.disabled = false;
            exportAllBtn.classList.remove('btn-outline-secondary');
            exportAllBtn.classList.add('btn-outline-success');
            exportAllBtn.title = `Exportar todos os ${allProspects.length} prospects carregados`;
        } else {
            exportAllBtn.disabled = true;
            exportAllBtn.classList.remove('btn-outline-success');
            exportAllBtn.classList.add('btn-outline-secondary');
            exportAllBtn.title = 'Faça uma busca primeiro para ativar';
        }
    }

    // Update Disparador PRO button
    if (exportDisparadorBtn && exportDisparadorCount) {
        const prospectsWithWhatsApp = allProspects.filter(p =>
            p.hasWhatsApp === true &&
            p.telefone &&
            p.telefone !== 'Telefone não disponível'
        );
        exportDisparadorCount.textContent = prospectsWithWhatsApp.length;

        if (prospectsWithWhatsApp.length > 0) {
            exportDisparadorBtn.disabled = false;
            exportDisparadorBtn.classList.remove('btn-outline-secondary');
            exportDisparadorBtn.classList.add('btn-warning');
            exportDisparadorBtn.title = `Exportar ${prospectsWithWhatsApp.length} prospects COM WhatsApp para Disparador PRO`;
        } else {
            exportDisparadorBtn.disabled = true;
            exportDisparadorBtn.classList.remove('btn-warning');
            exportDisparadorBtn.classList.add('btn-outline-secondary');
            exportDisparadorBtn.title = 'Nenhum prospect com WhatsApp confirmado encontrado';
        }
    }
}

// Handle Enter key in search
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        searchProspects();
    }
}

// Filter prospects - FUNÇÃO CORRIGIDA
function filterProspects() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    currentFilters.search = searchInput.value.trim();
    console.log('🔧 Filtro de busca atualizado:', currentFilters.search);

    applyFiltersToCurrentPage();
    loadProspects();
    updateMapMarkers();
}

// Apply filters - FUNÇÃO CORRIGIDA
function applyFilters() {
    const whatsappFilter = document.getElementById('whatsapp-filter');
    const ratingFilter = document.getElementById('rating-filter');

    if (!whatsappFilter || !ratingFilter) return;

    currentFilters.whatsapp = whatsappFilter.value;
    currentFilters.rating = ratingFilter.value;

    console.log('🔧 Filtros atualizados:', currentFilters);

    applyFiltersToCurrentPage();
    loadProspects();
    updateMapMarkers();
}

// Clear filters
function clearFilters() {
    const whatsappFilter = document.getElementById('whatsapp-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const searchInput = document.getElementById('search-input');

    if (whatsappFilter) whatsappFilter.value = '';
    if (ratingFilter) ratingFilter.value = '';
    if (searchInput) searchInput.value = '';

    // Reset filters
    currentFilters = {
        whatsapp: '',
        rating: '',
        search: ''
    };

    console.log('🔧 Filtros limpos');

    applyFiltersToCurrentPage();
    loadProspects();
    updateMapMarkers();
}

// Clear all selections across all pages
function clearAllSelections() {
    const totalBefore = selectedProspects.size;
    selectedProspects.clear();
    loadProspects();
    updateExportButton();

    showSuccessToast(`🗑️ Todas as seleções foram limpas (${totalBefore} prospects)`);
    debugLog('Todas as seleções foram limpas');
}

// Export to Excel - Selected
function exportToExcel() {
    if (selectedProspects.size === 0) return;

    const selectedData = allProspects.filter(p => selectedProspects.has(p.id));
    generateExcel(selectedData, 'prospects_selecionados');
}

// Export to Excel - All loaded prospects
function exportAll() {
    if (allProspects.length === 0) {
        showErrorToast('❌ Nenhum prospect encontrado para exportar. Faça uma busca primeiro!');
        return;
    }

    generateExcel(allProspects, 'todos_prospects');
}

// Export for Disparador PRO (simplified format)
function exportDisparadorPro() {
    if (allProspects.length === 0) {
        showErrorToast('❌ Nenhum prospect encontrado para exportar. Faça uma busca primeiro!');
        return;
    }

    // Filter prospects WITH WhatsApp confirmed and valid phone numbers
    const prospectsWithWhatsApp = allProspects.filter(prospect => {
        const cleanPhone = prospect.telefone ? prospect.telefone.replace(/\D/g, '') : '';
        return prospect.hasWhatsApp === true &&
            cleanPhone &&
            cleanPhone.length >= 10 &&
            prospect.telefone !== 'Telefone não disponível';
    });

    if (prospectsWithWhatsApp.length === 0) {
        showErrorToast('❌ Nenhum prospect com WhatsApp confirmado encontrado!');
        return;
    }

    debugLog(`Exportando ${prospectsWithWhatsApp.length} prospects COM WhatsApp para Disparador PRO`);

    // Generate simplified format for Disparador PRO
    const disparadorData = prospectsWithWhatsApp.map(prospect => {
        const cleanPhone = prospect.telefone.replace(/\D/g, '');

        // Format phone number: ensure it starts with 55 (Brazil code)
        let formattedPhone = cleanPhone;
        if (!formattedPhone.startsWith('55')) {
            if (formattedPhone.length === 11 || formattedPhone.length === 10) {
                formattedPhone = '55' + formattedPhone;
            }
        }

        debugLog(`Formatando telefone: ${prospect.telefone} → ${cleanPhone} → ${formattedPhone}`);

        return {
            'nome': prospect.name,
            'telefone': formattedPhone,
            'email': prospect.email || ''
        };
    });

    // Create Excel with simplified format
    const worksheet = XLSX.utils.json_to_sheet(disparadorData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Disparador PRO');

    // Style header
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "ffc107" } },
            color: { rgb: "000000" }
        };
    }

    // Auto-fit columns
    const colWidths = [
        { wch: 30 }, // nome
        { wch: 15 }, // telefone
        { wch: 30 }  // email
    ];
    worksheet['!cols'] = colWidths;

    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(workbook, `disparador_pro_${timestamp}.xlsx`);

    showSuccessToast(`📱 Disparador PRO exportado! ${prospectsWithWhatsApp.length} prospects com telefone incluídos.`);

    // Show summary
    const withEmail = disparadorData.filter(p => p.email).length;
    const withoutEmail = disparadorData.length - withEmail;

    setTimeout(() => {
        showSuccessToast(`📊 Resumo: ${withEmail} com e-mail, ${withoutEmail} sem e-mail`);
    }, 2000);
}

// Generate Excel file
function generateExcel(data, filename) {
    const exportData = data.map(prospect => {
        return {
            'Nome': prospect.name,
            'Endereço': prospect.endereco,
            'Telefone': prospect.telefone,
            'E-mail': prospect.email || 'Não informado',
            'Rating': prospect.rating || 'Não avaliado',
            'Avaliações': prospect.reviews || 0,
            'Website': prospect.website || 'Não informado',
            'WhatsApp': prospect.hasWhatsApp ? 'Sim' : 'Não',
            'Status': prospect.status === 'verified' ? 'Verificado' :
                prospect.status === 'no_whatsapp' ? 'Sem WhatsApp' : 'Verificando',
            'Categoria': prospect.category || 'Outros',
            'Tipos': prospect.types || 'Não informado',
            'Data_Exportacao': new Date().toLocaleDateString('pt-BR'),
            'Hora_Exportacao': new Date().toLocaleTimeString('pt-BR')
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

    // Add styling to header
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "0d6efd" } },
            color: { rgb: "ffffff" }
        };
    }

    // Auto-fit columns
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
            const address = XLSX.utils.encode_cell({ r: R, c: C });
            if (worksheet[address] && worksheet[address].v) {
                maxWidth = Math.max(maxWidth, worksheet[address].v.toString().length);
            }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = colWidths;

    // Save file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);

    // Count prospects with email
    const withEmail = data.filter(p => p.email && p.email !== 'Não informado').length;
    const totalProspects = data.length;

    showSuccessToast(`📊 Excel exportado com sucesso! ${totalProspects} prospects incluídos (${withEmail} com e-mail).`);
}

// Show success toast
function showSuccessToast(message) {
    const toastHtml = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div class="toast show" role="alert">
                <div class="toast-header">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <strong class="me-auto">Sucesso!</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHtml);

    setTimeout(() => {
        const toastElement = document.querySelector('.toast-container');
        if (toastElement) {
            toastElement.remove();
        }
    }, 5000);
}

// Show error toast
function showErrorToast(message) {
    const toastHtml = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div class="toast show" role="alert">
                <div class="toast-header">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                    <strong class="me-auto">Erro!</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHtml);

    setTimeout(() => {
        const toastElement = document.querySelector('.toast-container');
        if (toastElement) {
            toastElement.remove();
        }
    }, 5000);
}

// Show configuration modal
function showConfigModal() {
    const modalHtml = `
        <div class="modal fade" id="configModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-gear me-2"></i>Configurações das APIs
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- SerpAPI Configuration -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="bi bi-search me-2"></i>Configuração SerpAPI
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">API Key SerpAPI</label>
                                    <input type="password" class="form-control" id="serpapi-key" 
                                            value="${SERPAPI_CONFIG.apiKey}" 
                                            placeholder="Sua chave da SerpAPI">
                                    <div class="form-text">
                                        Obtenha sua chave em: <a href="https://serpapi.com" target="_blank">serpapi.com</a>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="togglePasswordVisibility('serpapi-key')">
                                    <i class="bi bi-eye"></i> Mostrar/Ocultar Chave
                                </button>
                            </div>
                        </div>

                        <!-- WhatsApp API Configuration -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="bi bi-whatsapp me-2"></i>Configuração WhatsApp API
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">URL Base da API WhatsApp</label>
                                    <input type="text" class="form-control" id="whatsapp-base-url" 
                                            value="${WHATSAPP_API_CONFIG.baseUrl}" 
                                            placeholder="https://evolutionapi.seudominio.com.br">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">Nome da Instância</label>
                                    <input type="text" class="form-control" id="whatsapp-instance" 
                                            value="${WHATSAPP_API_CONFIG.instance}" 
                                            placeholder="Nome da Instância">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-semibold">API Key / Token</label>
                                    <input type="password" class="form-control" id="whatsapp-api-key" 
                                            value="${WHATSAPP_API_CONFIG.apiKey}" 
                                            placeholder="Seu token de autenticação">
                                </div>
                                <button type="button" class="btn btn-outline-primary btn-sm mb-3" onclick="togglePasswordVisibility('whatsapp-api-key')">
                                    <i class="bi bi-eye"></i> Mostrar/Ocultar Token
                                </button>
                            </div>
                        </div>

                        <!-- Test APIs -->
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="bi bi-check-circle me-2"></i>Testar Configurações
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <button type="button" class="btn btn-outline-success w-100" onclick="testSerpAPI()">
                                            <i class="bi bi-search me-1"></i>Testar SerpAPI
                                        </button>
                                    </div>
                                    <div class="col-6">
                                        <button type="button" class="btn btn-outline-success w-100" onclick="testWhatsAppAPI()">
                                            <i class="bi bi-whatsapp me-1"></i>Testar WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveAllConfigs()">
                            <i class="bi bi-check me-1"></i>Salvar Todas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('configModal'));
    modal.show();

    document.getElementById('configModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

// Save all configurations
function saveAllConfigs() {
    const serpApiKey = document.getElementById('serpapi-key').value.trim();
    const baseUrl = document.getElementById('whatsapp-base-url').value.trim();
    const instance = document.getElementById('whatsapp-instance').value.trim();
    const whatsappApiKey = document.getElementById('whatsapp-api-key').value.trim();

    if (!serpApiKey) {
        showErrorToast('❌ Por favor, preencha a API Key do SerpAPI.');
        return;
    }

    if (!baseUrl || !instance || !whatsappApiKey) {
        showErrorToast('❌ Por favor, preencha todos os campos do WhatsApp API.');
        return;
    }

    SERPAPI_CONFIG.apiKey = serpApiKey;
    WHATSAPP_API_CONFIG.baseUrl = baseUrl;
    WHATSAPP_API_CONFIG.instance = instance;
    WHATSAPP_API_CONFIG.apiKey = whatsappApiKey;

    localStorage.setItem('serpapi_config', JSON.stringify({
        apiKey: serpApiKey
    }));

    localStorage.setItem('whatsapp_config', JSON.stringify({
        baseUrl: baseUrl,
        instance: instance,
        apiKey: whatsappApiKey
    }));

    updateSearchButtonState();

    const modal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
    modal.hide();

    showSuccessToast('✅ Configurações foram salvas com sucesso!');
    debugLog('Configurações salvas com sucesso');
}

// Test SerpAPI
async function testSerpAPI() {
    const testBtn = event.target;
    const originalText = testBtn.innerHTML;

    try {
        testBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Testando...';
        testBtn.disabled = true;

        const serpApiKey = document.getElementById('serpapi-key').value.trim();
        if (!serpApiKey) {
            throw new Error('Por favor, informe a API Key');
        }

        const params = new URLSearchParams({
            engine: 'google_maps',
            q: 'restaurante São Paulo',
            api_key: serpApiKey,
            hl: 'pt',
            gl: 'br',
            num: '3'
        });

        const serpApiUrl = `${SERPAPI_CONFIG.baseUrl}?${params}`;
        debugLog('Testando SerpAPI com:', serpApiUrl);

        let testResult = null;

        try {
            const response = await testSerpAPIWithFetch(serpApiUrl);
            testResult = response;
        } catch (error) {
            debugLog('Método fetch falhou:', error.message);

            try {
                testResult = await testSerpAPIKeyOnly(serpApiKey);
            } catch (error2) {
                throw new Error(`Falha nos testes: ${error2.message}`);
            }
        }

        if (testResult && testResult.success) {
            testBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i>✅ ${testResult.message}`;
            testBtn.className = 'btn btn-success w-100';
            debugLog('Teste SerpAPI bem-sucedido');
        } else {
            testBtn.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>⚠️ API Key válida';
            testBtn.className = 'btn btn-warning w-100';
            debugLog('API Key válida mas teste limitado');
        }

        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.className = 'btn btn-outline-success w-100';
            testBtn.disabled = false;
        }, 4000);

    } catch (error) {
        debugLog('Erro no teste SerpAPI:', error);
        testBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>❌ Erro';
        testBtn.className = 'btn btn-danger w-100';

        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.className = 'btn btn-outline-success w-100';
            testBtn.disabled = false;
        }, 4000);

        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            errorMessage = 'Bloqueio CORS detectado. A API funcionará nas buscas reais com proxy.';
        } else if (error.message.includes('Invalid API key')) {
            errorMessage = 'API Key inválida. Verifique sua chave no painel SerpAPI.';
        } else if (error.message.includes('credits')) {
            errorMessage = 'Créditos insuficientes na conta SerpAPI.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Problema de rede. Verifique sua conexão.';
        }

        alert(`Teste SerpAPI: ${errorMessage}`);
    }
}

// Test SerpAPI with fetch and proxy
async function testSerpAPIWithFetch(serpApiUrl) {
    for (let i = 0; i < SERPAPI_CONFIG.corsProxies.length; i++) {
        const proxy = SERPAPI_CONFIG.corsProxies[i];
        let proxiedUrl;

        if (proxy.includes('codetabs')) {
            proxiedUrl = proxy + encodeURIComponent(serpApiUrl);
        } else if (proxy.includes('allorigins')) {
            proxiedUrl = proxy + encodeURIComponent(serpApiUrl);
        } else {
            proxiedUrl = proxy + serpApiUrl;
        }

        try {
            debugLog(`Tentando proxy ${i + 1}: ${proxy}`);

            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            debugLog(`Status da resposta proxy: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            let serpApiData;
            if (proxy.includes('allorigins') && data.contents) {
                serpApiData = JSON.parse(data.contents);
            } else if (proxy.includes('codetabs')) {
                serpApiData = data;
            } else {
                serpApiData = data;
            }

            if (serpApiData.error) {
                throw new Error(`SerpAPI: ${serpApiData.error}`);
            }

            const hasResults = serpApiData.local_results && serpApiData.local_results.length > 0;
            const hasSearchInfo = serpApiData.search_information;

            if (hasResults || hasSearchInfo) {
                return {
                    success: true,
                    message: `SerpAPI OK (${serpApiData.local_results?.length || 0} resultados)`,
                    data: serpApiData
                };
            } else {
                return {
                    success: true,
                    message: 'SerpAPI OK (sem resultados)',
                    data: serpApiData
                };
            }

        } catch (error) {
            debugLog(`Proxy ${i + 1} falhou:`, error.message);
            if (i === SERPAPI_CONFIG.corsProxies.length - 1) {
                throw error;
            }
        }
    }
}

// Test only API key validity (simplified)
async function testSerpAPIKeyOnly(apiKey) {
    if (!apiKey || apiKey.length < 32) {
        throw new Error('Formato de API Key inválido');
    }

    return {
        success: false,
        message: 'Formato válido - teste limitado por CORS'
    };
}

// Test WhatsApp API
async function testWhatsAppAPI() {
    const testBtn = event.target;
    const originalText = testBtn.innerHTML;

    try {
        testBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Testando...';
        testBtn.disabled = true;

        const baseUrl = document.getElementById('whatsapp-base-url').value.trim();
        const instance = document.getElementById('whatsapp-instance').value.trim();
        const apiKey = document.getElementById('whatsapp-api-key').value.trim();

        if (!baseUrl || !instance || !apiKey) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }

        const url = `${baseUrl}/chat/whatsappNumbers/${instance}`;

        const headers = {
            'Content-Type': 'application/json',
            'apikey': apiKey
        };

        debugLog('Testando WhatsApp API:', { url, headers: { ...headers, apikey: '***' } });

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                numbers: ['5571999999999']
            })
        });

        debugLog(`Status da resposta WhatsApp test: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            debugLog('Erro HTTP WhatsApp test:', { status: response.status, error: errorText });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        debugLog('Resposta do teste WhatsApp:', result);

        if (Array.isArray(result) && result.length > 0 && result[0].hasOwnProperty('exists')) {
            const testResult = result[0];
            const hasWhatsApp = testResult.exists === true;
            const message = `API funcionando! Teste: ${hasWhatsApp ? 'WhatsApp detectado' : 'Sem WhatsApp'}`;

            testBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i>✅ ${message}`;
            testBtn.className = 'btn btn-success w-100';
            debugLog('Teste WhatsApp bem-sucedido');
        } else {
            testBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>✅ API OK';
            testBtn.className = 'btn btn-success w-100';
            debugLog('API WhatsApp respondendo corretamente');
        }

        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.className = 'btn btn-outline-success w-100';
            testBtn.disabled = false;
        }, 4000);

    } catch (error) {
        debugLog('Erro no teste WhatsApp:', error);

        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexão - Verifique URL';
        } else if (error.message.includes('401')) {
            errorMessage = 'API Key inválida';
        } else if (error.message.includes('404')) {
            errorMessage = 'Instância não encontrada';
        } else if (error.message.includes('500')) {
            errorMessage = 'Erro interno da API';
        } else if (error.message.includes('preencha todos')) {
            errorMessage = 'Campos obrigatórios vazios';
        }

        testBtn.innerHTML = `<i class="bi bi-x-circle me-1"></i>❌ ${errorMessage}`;
        testBtn.className = 'btn btn-danger w-100';

        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.className = 'btn btn-outline-success w-100';
            testBtn.disabled = false;
        }, 4000);
    }
}

// Load all configurations from localStorage
function loadAllConfigs() {
    const savedSerpApiConfig = localStorage.getItem('serpapi_config');
    if (savedSerpApiConfig) {
        try {
            const config = JSON.parse(savedSerpApiConfig);
            SERPAPI_CONFIG.apiKey = config.apiKey || SERPAPI_CONFIG.apiKey;
            debugLog('Configuração SerpAPI carregada');
        } catch (error) {
            debugLog('Erro ao carregar configuração SerpAPI:', error);
        }
    }

    const savedWhatsAppConfig = localStorage.getItem('whatsapp_config');
    if (savedWhatsAppConfig) {
        try {
            const config = JSON.parse(savedWhatsAppConfig);
            WHATSAPP_API_CONFIG.baseUrl = config.baseUrl || WHATSAPP_API_CONFIG.baseUrl;
            WHATSAPP_API_CONFIG.instance = config.instance || WHATSAPP_API_CONFIG.instance;
            WHATSAPP_API_CONFIG.apiKey = config.apiKey || WHATSAPP_API_CONFIG.apiKey;
            debugLog('Configuração WhatsApp carregada');
        } catch (error) {
            debugLog('Erro ao carregar configuração WhatsApp:', error);
        }
    }

    debugLog('Configurações atuais:', {
        serpapi: { hasApiKey: !!SERPAPI_CONFIG.apiKey },
        whatsapp: {
            hasBaseUrl: !!WHATSAPP_API_CONFIG.baseUrl,
            hasInstance: !!WHATSAPP_API_CONFIG.instance,
            hasApiKey: !!WHATSAPP_API_CONFIG.apiKey
        },
        theme: localStorage.getItem('prospecta_theme') || 'dark'
    });

    updateSearchButtonState();
}

// Initialize map
function initializeMap() {
    try {
        miniMap = L.map('minimap').setView([-14.235, -51.9253], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(miniMap);

        const info = L.control({ position: 'bottomleft' });
        info.onAdd = function () {
            const div = L.DomUtil.create('div', 'map-info');
            div.innerHTML = '<small class="text-muted">🔵 Com WhatsApp &nbsp; 🔴 Sem WhatsApp</small>';
            div.style.background = 'rgba(255,255,255,0.8)';
            div.style.padding = '5px';
            div.style.borderRadius = '3px';
            return div;
        };
        info.addTo(miniMap);

        debugLog('Mapa inicializado com sucesso');
    } catch (error) {
        debugLog('Erro ao inicializar mapa:', error);
    }
}

// Update map markers
function updateMapMarkers() {
    if (!miniMap) return;

    debugLog(`Atualizando marcadores do mapa para ${filteredProspects.length} prospects`);

    mapMarkers.forEach(marker => {
        miniMap.removeLayer(marker);
    });
    mapMarkers = [];

    let markersAdded = 0;

    filteredProspects.forEach((prospect, index) => {
        let lat, lng;

        if (prospect.gps_coordinates && prospect.gps_coordinates.latitude && prospect.gps_coordinates.longitude) {
            lat = prospect.gps_coordinates.latitude;
            lng = prospect.gps_coordinates.longitude;
        } else {
            const baseCoords = getBaseCoordinatesFromAddress(prospect.endereco);
            if (baseCoords) {
                lat = baseCoords.lat + (Math.random() - 0.5) * 0.01;
                lng = baseCoords.lng + (Math.random() - 0.5) * 0.01;
            } else {
                lat = -12.971598 + (Math.random() - 0.5) * 0.1;
                lng = -38.501310 + (Math.random() - 0.5) * 0.1;
            }
        }

        if (lat && lng) {
            debugLog(`Adicionando marcador para ${prospect.name} em ${lat}, ${lng}`);

            const markerColor = prospect.hasWhatsApp ? '#28a745' : '#dc3545';
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = L.marker([lat, lng], { icon: markerIcon });

            const popupContent = `
                <div class="prospect-popup">
                    <h6>${prospect.name}</h6>
                    <p class="mb-1"><i class="bi bi-geo-alt me-1"></i>${prospect.endereco}</p>
                    <p class="mb-1"><i class="bi bi-telephone me-1"></i>${formatPhoneNumber(prospect.telefone)}</p>
                    ${prospect.rating > 0 ? `
                        <p class="mb-1">
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            ${prospect.rating} (${prospect.reviews} avaliações)
                        </p>
                    ` : ''}
                    <div class="d-flex gap-1 mt-2">
                        <span class="badge ${prospect.hasWhatsApp ? 'bg-success' : 'bg-danger'}">
                            ${prospect.hasWhatsApp ? 'WhatsApp' : 'Sem WhatsApp'}
                        </span>
                        <span class="badge bg-primary">${prospect.category || 'Outros'}</span>
                    </div>
                    ${prospect.hasWhatsApp ? `
                        <div class="mt-2">
                            <a href="https://wa.me/${prospect.telefone.replace(/\D/g, '')}" target="_blank" class="btn btn-success btn-sm">
                                <i class="bi bi-whatsapp me-1"></i>Abrir WhatsApp
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(miniMap);
            mapMarkers.push(marker);
            markersAdded++;
        }
    });

    debugLog(`${markersAdded} marcadores adicionados ao mapa`);

    if (mapMarkers.length > 0) {
        setTimeout(() => {
            const group = new L.featureGroup(mapMarkers);
            miniMap.fitBounds(group.getBounds().pad(0.1));
        }, 100);
    }
}

// Get base coordinates from address (simplified geocoding)
function getBaseCoordinatesFromAddress(address) {
    if (!address) return null;

    const addressLower = address.toLowerCase();

    if (addressLower.includes('salvador') || addressLower.includes('pituba') || addressLower.includes('barra') || addressLower.includes('ondina')) {
        return { lat: -12.971598, lng: -38.501310 };
    }

    if (addressLower.includes('são paulo') || addressLower.includes('sp')) {
        return { lat: -23.550520, lng: -46.633309 };
    }

    if (addressLower.includes('rio de janeiro') || addressLower.includes('copacabana') || addressLower.includes('ipanema')) {
        return { lat: -22.906847, lng: -43.172896 };
    }

    if (addressLower.includes('belo horizonte') || addressLower.includes('mg')) {
        return { lat: -19.919054, lng: -43.945973 };
    }

    if (addressLower.includes('brasília') || addressLower.includes('df')) {
        return { lat: -15.794229, lng: -47.882166 };
    }

    return { lat: -14.235, lng: -51.9253 };
}

// Center map on search results
function centerMapOnResults() {
    if (!miniMap || mapMarkers.length === 0) return;

    if (mapMarkers.length === 1) {
        miniMap.setView(mapMarkers[0].getLatLng(), 15);
    } else {
        const group = new L.featureGroup(mapMarkers);
        miniMap.fitBounds(group.getBounds().pad(0.1));
    }
}

// Toggle map view (street/satellite)
function toggleMapView() {
    if (!miniMap) return;

    miniMap.eachLayer(function (layer) {
        if (layer instanceof L.TileLayer) {
            miniMap.removeLayer(layer);
        }
    });

    if (currentMapView === 'street') {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 18
        }).addTo(miniMap);
        currentMapView = 'satellite';
        document.getElementById('map-view-icon').className = 'bi bi-map';
    } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(miniMap);
        currentMapView = 'street';
        document.getElementById('map-view-icon').className = 'bi bi-layers';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    init();
});