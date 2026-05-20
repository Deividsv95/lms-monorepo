function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <p>&copy; {currentYear} LMS Portal. All rights reserved.</p>
        <nav className="footer-links" aria-label="Footer">
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <a href="#terms" className="footer-link">Terms of Service</a>
          <a href="#support" className="footer-link">Support</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
