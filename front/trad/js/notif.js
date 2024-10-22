function changeLanguage(translations) {
    const translation = translations;
    console.log(translation);
    if (translation) {
        // Update main content translations
        document.getElementById('homeTitle').textContent = translation.homePage.homeTitle;
        document.getElementById('descriptionHomeMessage').textContent = translation.homePage.descriptionHomeMessage;
        document.getElementById('descriptionHomeMessage2').textContent = translation.homePage.descriptionHomeMessage2;

        // Update menu translations using innerHTML
        document.getElementById('menuHome').innerHTML = `<i class="bi bi-house-fill"></i> ${translation.menu.home}`;
        document.getElementById('menuGame').innerHTML = `<i class="bi bi-controller"></i> ${translation.menu.game}`;
        document.getElementById('menuProfile').innerHTML = `<i class="bi bi-person"></i> ${translation.menu.profile}`;
        document.getElementById('menuFriends').innerHTML = `<i class="bi bi-person-heart"></i> ${translation.menu.friends}`;
        document.getElementById('menuLogout').innerHTML = `<i class="bi bi-box-arrow-in-right"></i> ${translation.menu.logout}`;
        document.getElementById('menuLogin').innerHTML = `<i class="bi bi-box-arrow-in-left"></i> ${translation.menu.login}`;
    }
}


// On page load, fetch the translations and apply the selected language
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const selectedLang = params.get('lang') || 'en'; // Default to English if no language parameter is found
    console.log(selectedLang);
    const translationFile = selectedLang === 'fr' ? './json/fr.json' : './json/en.json';

    fetch(translationFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(translations => {
            changeLanguage(translations);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});


var inviteModalEl = document.getElementById('inviteModal');
inviteModalEl.addEventListener('show.bs.modal', function () {
    populateInvites(invites); // Call your function to populate invites
});

const invites = [
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'John Doe',
        message: 'John Doe has sent you an invite for a local pong!'
    },
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'Jane Smith',
        message: 'Jane Smith has sent you an invite for a remote pong!'
    },
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'Thomas Moore',
        message: 'Thomas Moore has sent you an invite for a local connect4!'
    },
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'Guillaume',
        message: 'Guillaume has sent you an invite for a remote connect4!'
    }
    ,
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'Xavier Sirius',
        message: 'Xavier Sirius has sent you an invite for a pong tournament!'
    },
    {
        profilePic: './img/ts/RED.jpeg',
        name: 'Leo Nidas',
        message: 'Leo Nidas has sent you an invite for a connect4 tournament!'
    }
];

function populateInvites(invites) {
    const inviteList = document.getElementById('inviteList');
    inviteList.innerHTML = ''; // Clear existing invites

    invites.forEach(invite => {
        const inviteItem = document.createElement('li');
        inviteItem.className = 'list-group-item';

        inviteItem.innerHTML = `
    <div class="d-flex align-items-center">
        <img src="${invite.profilePic}" alt="${invite.name}" class="rounded-circle me-3" width="50" height="50">
        <div class="flex-grow-1">
            <h5><strong>${invite.name}</strong></h5>
            <p>${invite.message}</p>
        </div>
    </div>
    <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-success btn-sm me-2" onclick="acceptInvite('${invite.name}')">
            <i class="bi bi-check-circle"></i> Accept
        </button>
        <button class="btn btn-danger btn-sm" onclick="refuseInvite('${invite.name}')">
            <i class="bi bi-x-circle"></i> Refuse
        </button>
    </div>
`;

        inviteList.appendChild(inviteItem);
    });
}



function acceptInvite(name) {
    alert(`${name} has been accepted!`); // Placeholder action
    // Add your logic for accepting the invite
}

function refuseInvite(name) {
    alert(`${name} has been refused!`); // Placeholder action
    // Add your logic for refusing the invite
}

function updateNotificationCount(count) {
    const badge = document.getElementById('notificationbell');
    badge.textContent = count;

    if (count > 0) {
        badge.innerHTML = `<div class="notification-badge">${count}</div>`
    }
}
setTimeout(() => {
    updateNotificationCount(1); // Update count to 2
}, 3000);