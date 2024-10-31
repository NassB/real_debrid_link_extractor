// content.js
function extractRealDebridLinks() {
    console.log('🔍 Début de l\'extraction des liens...');

    // Pattern pour les liens Real-Debrid
    const pattern = /https:\/\/[^\/]+\.download\.real-debrid\.com\/d\/[A-Za-z0-9]+\/[^"'\s<>]+/g;
    console.log('📋 Pattern utilisé:', pattern);

    // Récupérer tout le contenu HTML
    const htmlContent = document.documentElement.innerHTML;
    console.log('📄 Longueur du contenu HTML:', htmlContent.length);

    // Extraire les liens correspondants
    const links = htmlContent.match(pattern) || [];
    console.log('🔗 Nombre de liens trouvés:', links ? links.length : 0);

    // Éliminer les doublons
    const uniqueLinks = links ? [...new Set(links)] : [];
    console.log('✨ Nombre de liens uniques:', uniqueLinks.length);

    return uniqueLinks;
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message reçu du popup:', request);

    if (request.action === "extractLinks") {
        console.log('🎯 Action: extraction des liens');
        const links = extractRealDebridLinks();
        console.log('✅ Extraction terminée');
        sendResponse({links});
    }
    return true;
});