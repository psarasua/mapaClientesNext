'use client';

import { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Badge } from 'react-bootstrap';
import { 
  FaHome, 
  FaUsers, 
  FaTruck, 
  FaUserFriends, 
  FaCalendarAlt, 
  FaMapMarkedAlt, 
  FaBoxes
} from 'react-icons/fa';

export default function Navigation({ activeSection, onSectionChange }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, badge: null },
    { id: 'users', label: 'Usuarios', icon: <FaUsers />, badge: null },
    { id: 'trucks', label: 'Camiones', icon: <FaTruck />, badge: null },
    { id: 'clients', label: 'Clientes', icon: <FaUserFriends />, badge: null },
    { id: 'diasEntrega', label: 'Días de Entrega', icon: <FaCalendarAlt />, badge: null },
    { id: 'repartos', label: 'Repartos', icon: <FaMapMarkedAlt />, badge: null },
    { id: 'clientesporreparto', label: 'Asignaciones', icon: <FaBoxes />, badge: null }
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
