document.addEventListener('DOMContentLoaded', async () => { 
    let personalData;
    let translations;

    let currentLang = localStorage.getItem('lang') || 'es'; 
    let currentTheme = localStorage.getItem('theme') || 'light'; 

    try {
        const dataResponse = await fetch('data.json');
        personalData = await dataResponse.json();

        const translationsResponse = await fetch('translations.json');
        translations = await translationsResponse.json();

        initializeSite();

    } catch (error) {
        console.error('Error loading data or translations:', error);
        document.body.innerHTML = '<p style="text-align: center; color: red;">Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.</p>';
    }

    function initializeSite() {
        const updateTextContent = () => {
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[currentLang] && translations[currentLang][key]) {
                    element.textContent = translations[currentLang][key];
                }
            });
            const projectsList = document.getElementById('projects-list');
            if (projectsList.innerHTML.includes('data-translate="experience.no-projects"')) {
                 document.querySelector('[data-translate="experience.no-projects"]').textContent = translations[currentLang]['experience.no-projects'];
            }
            document.querySelectorAll('[data-translate="project.view-repo"]').forEach(el => {
                el.textContent = translations[currentLang]['project.view-repo'] + ' '; 
                const icon = document.createElement('i');
                icon.className = 'fas fa-external-link-alt ms-2';
                el.appendChild(icon);
            });
        };

        const loadPersonalData = () => {
            document.getElementById('nav-brand-name').textContent = personalData.fullName;
            document.getElementById('hero-name').textContent = personalData.fullName;

            const heroRoleTextElement = document.getElementById('hero-role-text');
            heroRoleTextElement.textContent = ''; 
            typeWriterEffect(heroRoleTextElement, personalData.profession, 100);

            document.getElementById('about-text').textContent = personalData.aboutMe;

            const skillsList = document.getElementById('skills-list');
            skillsList.innerHTML = ''; 
            personalData.skills.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'badge text-bg-primary'; 
                span.textContent = skill;
                skillsList.appendChild(span);
            });

            const educationList = document.getElementById('education-list');
            educationList.innerHTML = ''; 
            personalData.education.forEach(edu => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 col-lg-5 mb-4';
                colDiv.innerHTML = `
                    <div class="education-item card h-100">
                        <div class="card-body">
                            <h4 class="card-title">${edu.degree}</h4>
                            <p class="card-subtitle text-muted mb-2">${edu.institution}</p>
                            <p class="card-text">${edu.dates}</p>
                        </div>
                    </div>
                `;
                educationList.appendChild(colDiv);
            });

            const projectsList = document.getElementById('projects-list');
            projectsList.innerHTML = ''; 
            if (personalData.projects.length > 0) {
                personalData.projects.forEach(project => {
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-md-6 col-lg-5 mb-4';
                    colDiv.innerHTML = `
                        <div class="project-item card h-100">
                            <div class="card-body d-flex flex-column">
                                <h4 class="card-title">${project.name}</h4>
                                <p class="card-text flex-grow-1">${project.description}</p>
                                <div class="tech-stack mb-3">
                                    ${project.technologies.map(tech => `<span class="badge text-bg-secondary">${tech}</span>`).join('')}
                                </div>
                                ${project.repoLink ? `<a href="${project.repoLink}" target="_blank" class="btn btn-primary mt-auto" data-translate="project.view-repo"></a>` : ''}
                            </div>
                        </div>
                    `;
                    projectsList.appendChild(colDiv);
                });
            } else {
                const noProjectsMessage = document.createElement('div');
                noProjectsMessage.className = 'col-12 text-center text-muted';
                noProjectsMessage.innerHTML = '<p data-translate="experience.no-projects"></p>'; 
                projectsList.appendChild(noProjectsMessage);
            }

            const contactEmail = document.getElementById('contact-email');
            const contactEmailLink = document.getElementById('contact-email-link');
            contactEmail.textContent = personalData.email;
            contactEmailLink.href = `mailto:${personalData.email}`;

            const socialLinksContainer = document.getElementById('social-links');
            socialLinksContainer.innerHTML = ''; 
            personalData.socialLinks.forEach(link => {
                const anchor = document.createElement('a');
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.className = 'social-link';
                anchor.setAttribute('aria-label', link.name);
                anchor.innerHTML = `<i class="${link.icon}"></i>`;
                socialLinksContainer.appendChild(anchor);
            });

            document.getElementById('footer-name').textContent = personalData.fullName;
        };

        const typeWriterEffect = (element, text, speed) => {
            let i = 0;
            element.textContent = ''; 
            element.style.borderRight = '.15em solid orange'; 
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    element.style.borderRight = 'none'; 
                }
            };
            type();
        };

        document.querySelectorAll('.lang-switch').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                currentLang = e.target.dataset.lang;
                localStorage.setItem('lang', currentLang);
                loadPersonalData(); 
                updateTextContent(); 
            });
        });

        const themeToggleBtn = document.getElementById('theme-toggle');
        const applyTheme = (theme) => {
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(theme + '-mode');
            themeToggleBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        };

        themeToggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        });

        const copyEmailBtn = document.getElementById('copy-email-btn');
        const copyFeedback = document.getElementById('copy-feedback');
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(personalData.email)
                .then(() => {
                    copyFeedback.style.display = 'inline';
                    setTimeout(() => {
                        copyFeedback.style.display = 'none';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy email: ', err);
                });
        });

        loadPersonalData();
        updateTextContent();
        applyTheme(currentTheme);
    } 
}); 