// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        extractBtn: document.getElementById('extractBtn'),
        copyBtn: document.getElementById('copyBtn'),
        loader: document.getElementById('loader'),
        error: document.getElementById('error'),
        successMessage: document.querySelector('.success-message'),
        linksDiv: document.getElementById('linksList'),
        progressBar: document.querySelector('.progress-bar'),
        progressText: document.getElementById('progressPercent')
    };

    const showMessage = (element, message, duration = 3000) => {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', duration);
    };

    const updateProgress = (processed, total) => {
        const percentage = Math.round((processed / total) * 100);
        elements.progressBar.style.width = `${percentage}%`;
        elements.progressText.textContent = percentage;
        return percentage;
    };

    const resetInterface = () => {
        elements.copyBtn.style.display = 'none';
        elements.error.style.display = 'none';
        elements.successMessage.style.display = 'none';
        elements.linksDiv.innerHTML = '';
        elements.loader.style.display = 'block';
        elements.extractBtn.disabled = true;
        updateProgress(0, 1);
    };

    const processLinks = (links) => {
        const fragment = document.createDocumentFragment();
        links.forEach((link, index) => {
            setTimeout(() => {
                const linkElement = document.createElement('div');
                linkElement.className = 'link-item fade-in';
                linkElement.textContent = link;
                fragment.appendChild(linkElement);

                if (index === links.length - 1) {
                    elements.linksDiv.appendChild(fragment);
                    elements.loader.style.display = 'none';
                    elements.extractBtn.disabled = false;
                    elements.copyBtn.style.display = 'block';
                    showMessage(elements.successMessage, `${links.length} liens extraits avec succès!`);
                }
                updateProgress(index + 1, links.length);
            }, index * 30);
        });
    };

    elements.extractBtn.addEventListener('click', async () => {
        try {
            resetInterface();
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.tabs.sendMessage(tab.id, {action: "extractLinks"}, (response) => {
                if (chrome.runtime.lastError) {
                    throw new Error(chrome.runtime.lastError);
                }
                if (response?.links?.length) {
                    processLinks(response.links);
                } else {
                    throw new Error('Aucun lien trouvé');
                }
            });
        } catch (error) {
            console.error('Erreur:', error);
            elements.loader.style.display = 'none';
            elements.extractBtn.disabled = false;
            showMessage(elements.error, error.message || 'Une erreur est survenue');
        }
    });

    elements.copyBtn.addEventListener('click', async () => {
        try {
            const links = Array.from(elements.linksDiv.children).map(div => div.textContent);
            await navigator.clipboard.writeText(links.join('\n'));
            elements.copyBtn.textContent = '✓ Copié!';
            setTimeout(() => {
                elements.copyBtn.textContent = '📋 Copier tous les liens';
            }, 2000);
            showMessage(elements.successMessage, 'Liens copiés dans le presse-papiers!');
        } catch (error) {
            showMessage(elements.error, 'Erreur lors de la copie des liens');
        }
    });
});