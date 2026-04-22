// frontend/navigation-helper.js
class NavigationHelper {
  constructor() {
    this.basePath = this.getBasePath();
  }

  getBasePath() {
    // All files are in the same 'frontend' folder
    // So basePath should be empty (current directory)
    return './';
  }

  navigateTo(page) {
    const pages = {
      'home': 'homepage.html',
      'explore': 'explore.html',
      'about': 'about.html',
      'myProfile': 'MyProfile.html',
      'myProjects': 'MyProfile.html',  // ✅ FIXED: Changed from MyProject.html
      'projectDetails': 'project-detail.html',
      'notifications': 'notification.html',
      'settings': 'Setting.html',
      'students': 'StudentRecord.html',
      'submit': 'submit.html',
      'login': 'login.html',
      'register': 'register.html'
    };

    if (pages[page]) {
      window.location.href = this.basePath + pages[page];
    } else {
      console.warn(`Page '${page}' not found in navigation routes`);
    }
  }

  getPath(page) {
    const pages = {
      'home': 'homepage.html',
      'explore': 'explore.html',
      'about': 'about.html',
      'myProfile': 'MyProfile.html',
      'myProjects': 'MyProfile.html',  // ✅ FIXED: Changed from MyProject.html
      'projectDetails': 'project-detail.html',
      'notifications': 'notification.html',
      'settings': 'Setting.html',
      'students': 'StudentRecord.html',
      'submit': 'submit.html',
      'login': 'login.html',
      'register': 'register.html'
    };

    return this.basePath + (pages[page] || '');
  }
}

const nav = new NavigationHelper();