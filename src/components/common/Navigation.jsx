'use client';

import { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Badge } from 'react-bootstrap';

// Iconos SVG con colores originales
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7V10H3V20H9V14H15V20H21V10H22V7L12 2Z" fill="#4A90E2" stroke="#2E5C8A" strokeWidth="1"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="4" fill="#F39C12" stroke="#E67E22" strokeWidth="1"/>
    <path d="M1 21V19C1 16.7909 2.79086 15 5 15H13C15.2091 15 17 16.7909 17 19V21" fill="#F39C12" stroke="#E67E22" strokeWidth="1"/>
    <circle cx="17" cy="7" r="3" fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>
    <path d="M23 21V19.5C23 17.567 21.433 16 19.5 16" fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>
  </svg>
);

const IconTruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="1" y="8" width="13" height="8" rx="1" fill="#27AE60" stroke="#2ECC71" strokeWidth="1"/>
    <path d="M14 8V12H20L18 8H14Z" fill="#27AE60" stroke="#2ECC71" strokeWidth="1"/>
    <circle cx="6" cy="18" r="2" fill="#34495E" stroke="#2C3E50" strokeWidth="1"/>
    <circle cx="18" cy="18" r="2" fill="#34495E" stroke="#2C3E50" strokeWidth="1"/>
  </svg>
);

const IconClients = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="12" rx="2" fill="#9B59B6" stroke="#8E44AD" strokeWidth="1"/>
    <circle cx="9" cy="10" r="2" fill="#ECF0F1" stroke="#BDC3C7" strokeWidth="1"/>
    <path d="M5 16C5.5 14 7 13 9 13C11 13 12.5 14 13 16" fill="#ECF0F1" stroke="#BDC3C7" strokeWidth="1"/>
    <rect x="15" y="8" width="3" height="1" fill="#ECF0F1"/>
    <rect x="15" y="10" width="3" height="1" fill="#ECF0F1"/>
    <rect x="15" y="12" width="2" height="1" fill="#ECF0F1"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#E67E22" stroke="#D35400" strokeWidth="1"/>
    <path d="M16 2V6M8 2V6" stroke="#D35400" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 10H21" stroke="#D35400" strokeWidth="2"/>
    <circle cx="9" cy="14" r="1" fill="#ECF0F1"/>
    <circle cx="15" cy="14" r="1" fill="#ECF0F1"/>
    <circle cx="9" cy="17" r="1" fill="#ECF0F1"/>
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 2L1 6V20L9 16L15 20L23 16V2L15 6L9 2Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>
    <path d="M9 16V2M15 20V6" stroke="#C0392B" strokeWidth="1"/>
    <circle cx="12" cy="8" r="2" fill="#F1C40F" stroke="#F39C12" strokeWidth="1"/>
  </svg>
);

const IconBoxes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3498DB" stroke="#2980B9" strokeWidth="1"/>
    <path d="M2 17L12 22L22 17" fill="#3498DB" stroke="#2980B9" strokeWidth="1"/>
    <path d="M2 12L12 17L22 12" fill="#52C4F2" stroke="#3498DB" strokeWidth="1"/>
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#95A5A6" stroke="#7F8C8D" strokeWidth="1"/>
    <path d="M19.4 15C19.2 15.3 19.1 15.7 19.1 16C19.1 16.3 19.2 16.7 19.4 17L21.2 18.6C21.4 18.8 21.4 19.1 21.3 19.4L19.6 22.6C19.5 22.9 19.2 23 18.9 22.9L16.6 22C16.1 22.4 15.5 22.7 14.9 22.9L14.5 25.4C14.5 25.7 14.2 26 13.9 26H10.4C10.1 26 9.8 25.7 9.8 25.4L9.4 22.9C8.8 22.7 8.2 22.4 7.7 22L5.4 22.9C5.1 23 4.8 22.9 4.7 22.6L3 19.4C2.9 19.1 3 18.8 3.2 18.6L5 17C4.8 16.7 4.7 16.3 4.7 16C4.7 15.7 4.8 15.3 5 15L3.2 13.4C3 13.2 3 12.9 3.1 12.6L4.8 9.4C4.9 9.1 5.2 9 5.5 9.1L7.8 10C8.3 9.6 8.9 9.3 9.5 9.1L9.9 6.6C9.9 6.3 10.2 6 10.5 6H14C14.3 6 14.6 6.3 14.6 6.6L15 9.1C15.6 9.3 16.2 9.6 16.7 10L19 9.1C19.3 9 19.6 9.1 19.7 9.4L21.4 12.6C21.5 12.9 21.4 13.2 21.2 13.4L19.4 15Z" fill="#95A5A6" stroke="#7F8C8D" strokeWidth="1"/>
  </svg>
);

export default function Navigation({ activeSection, onSectionChange }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconHome />, badge: null },
    { id: 'users', label: 'Usuarios', icon: <IconUsers />, badge: null },
    { id: 'trucks', label: 'Camiones', icon: <IconTruck />, badge: null },
    { id: 'clients', label: 'Clientes', icon: <IconClients />, badge: null },
    { id: 'diasEntrega', label: 'Días de Entrega', icon: <IconCalendar />, badge: null },
    { id: 'repartos', label: 'Repartos', icon: <IconMap />, badge: null },
    { id: 'clientesporreparto', label: 'Asignaciones', icon: <IconBoxes />, badge: null },
    { id: 'configuracion', label: 'Configuración', icon: <IconSettings />, badge: null }
  ];

  const handleMenuClick = (sectionId) => {
    onSectionChange(sectionId);
    handleClose();
  };

  return (
    <>
      {/* Navbar Principal */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold">
            📍 MapaClientes
          </Navbar.Brand>
          
          {/* Botón de menú para móvil */}
          <Navbar.Toggle 
            aria-controls="offcanvasNavbar" 
            onClick={handleShow}
          />

          {/* Navegación principal para desktop */}
          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
            <Nav className="me-auto">
              {menuItems.map((item) => (
                <Nav.Link
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`d-flex align-items-center ${
                    activeSection === item.id ? 'active' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <Badge bg="danger" className="ms-2">
                      {item.badge}
                    </Badge>
                  )}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Offcanvas para móvil */}
      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            📍 MapaClientes
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`d-flex align-items-center py-3 ${
                  activeSection === item.id ? 'active bg-primary bg-opacity-10 rounded' : ''
                }`}
                style={{ cursor: 'pointer' }}
              >
                <span className="me-3 fs-5">{item.icon}</span>
                <div className="flex-grow-1">
                  {item.label}
                  {item.badge && (
                    <Badge bg="danger" className="ms-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
