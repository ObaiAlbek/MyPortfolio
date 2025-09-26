    // Projekt-Buttons (Demo)
    document.querySelectorAll('.btn-primary.small').forEach(button => {
      button.addEventListener('click', function() {
        const projectTitle = this.closest('.project-card').querySelector('.project-title').textContent;
        alert(`Projekt "${projectTitle}" wird angezeigt - diese Funktion kann später mit echten Links implementiert werden.`);
      });
    });