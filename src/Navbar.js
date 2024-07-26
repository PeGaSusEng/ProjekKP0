export class NavbarJS {
    constructor (NavbarId) {
        this.Data_Navbar = document.getElementById(NavbarId);
        this.Navbar_Function();
    }

    Navbar_Function(){
        this.Data_Navbar.innerHTML = `
            <div id="header">
                <a href="#default" id="logo">HYDRO-STIV</a>
                <div id="header-right">
                </div>
            </div>
        `
    }
}