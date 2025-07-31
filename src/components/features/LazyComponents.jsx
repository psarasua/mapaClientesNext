import React, { Suspense } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy loading de componentes pesados
const LazyUserList = React.lazy(() => import('./UserList'));
const LazyTruckList = React.lazy(() => import('./TruckList'));
const LazyClientList = React.lazy(() => import('./ClientList'));
const LazyDiaEntregaList = React.lazy(() => import('./DiaEntregaList'));
const LazyRepartoList = React.lazy(() => import('./RepartoList'));
const LazyClientesporRepartoList = React.lazy(() => import('./ClientesporRepartoList'));
const LazyConfiguracionPage = React.lazy(() => import('../../app/configuracion/page'));

// Componentes con lazy loading
export const LazyUserListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando usuarios..." />}>
    <LazyUserList />
  </Suspense>
);

export const LazyTruckListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando camiones..." />}>
    <LazyTruckList />
  </Suspense>
);

export const LazyClientListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando clientes..." />}>
    <LazyClientList />
  </Suspense>
);

export const LazyDiaEntregaListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando días de entrega..." />}>
    <LazyDiaEntregaList />
  </Suspense>
);

export const LazyRepartoListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando repartos..." />}>
    <LazyRepartoList />
  </Suspense>
);

export const LazyClientesporRepartoListComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando asignaciones..." />}>
    <LazyClientesporRepartoList />
  </Suspense>
);

export const LazyConfiguracionPageComponent = () => (
  <Suspense fallback={<LoadingSpinner message="Cargando configuración..." />}>
    <LazyConfiguracionPage />
  </Suspense>
); 