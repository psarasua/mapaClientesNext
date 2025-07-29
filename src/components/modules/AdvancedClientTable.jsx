'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Button, Modal, Badge, ButtonGroup, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import ClientMapComponent from './ClientMapComponent.jsx';

const columnHelper = createColumnHelper();

const AdvancedClientTable = ({ 
  clients = [], 
  onEdit, 
  onDelete, 
  isLoading, 
  createMutationPending, 
  updateMutationPending, 
  deleteMutationPending 
}) => {
  // Estados locales
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Función para mostrar mapa
  const handleShowMap = useCallback((client) => {
    setSelectedClient(client);
    setShowMap(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setShowMap(false);
    setSelectedClient(null);
  }, []);

  // Definición de columnas
  const columns = useMemo(() => [
    // Columna de selección
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="form-check-input"
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected() ? true : undefined,
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-check-input"
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected() ? true : undefined,
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
      size: 50,
      enableSorting: false,
      enableColumnFilter: false,
    }),

    // ID
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-secondary">{info.getValue() || 'N/A'}</span>
      ),
      size: 60,
      filterFn: 'includesString',
    }),

    // Código
    columnHelper.accessor('Codigo', {
      header: 'Código',
      cell: (info) => <small>{info.getValue() || '-'}</small>,
      size: 80,
      filterFn: 'includesString',
    }),

    // Nombre
    columnHelper.accessor('Nombre', {
      header: 'Nombre',
      cell: (info) => <strong>{info.getValue() || 'Sin nombre'}</strong>,
      size: 150,
      filterFn: 'includesString',
    }),

    // Razón Social
    columnHelper.accessor('Razon', {
      header: 'Razón Social',
      cell: (info) => info.getValue() || '-',
      size: 150,
      filterFn: 'includesString',
    }),

    // Dirección
    columnHelper.accessor('Direccion', {
      header: 'Dirección',
      cell: (info) => (
        <span className="text-truncate d-block" title={info.getValue()}>
          {info.getValue() || '-'}
        </span>
      ),
      size: 180,
      filterFn: 'includesString',
    }),

    // Teléfono
    columnHelper.accessor('Telefono1', {
      header: 'Teléfono',
      cell: (info) => <small>{info.getValue() || '-'}</small>,
      size: 100,
      filterFn: 'includesString',
    }),

    // RUT
    columnHelper.accessor('Ruc', {
      header: 'RUT',
      cell: (info) => <small>{info.getValue() || '-'}</small>,
      size: 120,
      filterFn: 'includesString',
    }),

    // Estado
    columnHelper.accessor('Activo', {
      header: 'Estado',
      cell: (info) => (
        <span className={`badge ${info.getValue() ? 'bg-success' : 'bg-danger'}`}>
          {info.getValue() ? 'Activo' : 'Inactivo'}
        </span>
      ),
      size: 80,
      filterFn: (row, columnId, value) => {
        if (value === 'all') return true;
        const isActive = row.getValue(columnId);
        return value === 'active' ? isActive : !isActive;
      },
    }),

    // Ubicación
    columnHelper.display({
      id: 'ubicacion',
      header: 'Ubicación',
      cell: ({ row }) => {
        const client = row.original;
        return client.Coordenada_x && client.Coordenada_y ? (
          <button
            onClick={() => handleShowMap(client)}
            title={`Ver ubicación: ${client.Coordenada_y.toFixed(4)}, ${client.Coordenada_x.toFixed(4)}`}
            style={{ 
              width: '32px', 
              height: '32px', 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#28a745'
            }}
          >
            <i className="bi bi-flag-fill" style={{ fontSize: '16px' }}></i>
          </button>
        ) : (
          <button
            disabled
            title="Sin coordenadas de ubicación"
            style={{ 
              width: '32px', 
              height: '32px', 
              background: 'transparent',
              border: 'none',
              cursor: 'not-allowed',
              padding: 0,
              color: '#dc3545',
              opacity: 0.7
            }}
          >
            <i className="bi bi-flag-fill" style={{ fontSize: '16px' }}></i>
          </button>
        );
      },
      size: 70,
      enableSorting: false,
      enableColumnFilter: false,
    }),

    // Acciones
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <ButtonGroup>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Editar cliente</Tooltip>}
            >
              <Button
                onClick={() => onEdit(client)}
                variant="outline-primary"
                size="sm"
                disabled={isLoading || createMutationPending || updateMutationPending}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Eliminar cliente</Tooltip>}
            >
              <Button
                onClick={() => onDelete(client.id, client.Nombre)}
                variant="outline-danger"
                size="sm"
                disabled={deleteMutationPending}
              >
                {deleteMutationPending ? (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                  <i className="bi bi-trash"></i>
                )}
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
        );
      },
      size: 100,
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [handleShowMap, onEdit, onDelete, isLoading, createMutationPending, updateMutationPending, deleteMutationPending]);

  // Configuración de la tabla
  const table = useReactTable({
    data: clients,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Funciones de exportación
  const exportToExcel = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    XLSX.writeFile(workbook, `clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [table]);

  const csvData = useMemo(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
  }, [table]);

  // Filtro personalizado para columna Estado
  const StatusFilter = ({ column }) => {
    const columnFilterValue = column.getFilterValue();
    
    return (
      <Form.Select
        size="sm"
        value={columnFilterValue ?? 'all'}
        onChange={(e) => column.setFilterValue(e.target.value === 'all' ? undefined : e.target.value)}
      >
        <option value="all">Todos</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </Form.Select>
    );
  };

  // Filtro genérico para texto
  const TextFilter = ({ column, placeholder = "Filtrar..." }) => {
    const columnFilterValue = column.getFilterValue();
    
    return (
      <Form.Control
        size="sm"
        type="text"
        value={columnFilterValue ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={placeholder}
        className="w-100"
      />
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Controles superiores */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 align-items-center">
          {/* Búsqueda global */}
          <Form.Control
            type="text"
            placeholder="Buscar en todas las columnas..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ width: '300px' }}
          />
          
          {/* Selector de filas por página */}
          <Form.Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </Form.Select>
        </div>

        {/* Botones de exportación */}
        <div className="d-flex gap-2">
          <Button variant="outline-success" size="sm" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i>
            Excel
          </Button>
          <CSVLink
            data={csvData}
            filename={`clientes_${new Date().toISOString().split('T')[0]}.csv`}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-file-earmark-text me-1"></i>
            CSV
          </CSVLink>
        </div>
      </div>

      {/* Información de selección */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="alert alert-info py-2 mb-3">
          <i className="bi bi-info-circle me-2"></i>
          {Object.keys(rowSelection).length} fila(s) seleccionada(s) de {table.getFilteredRowModel().rows.length}
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setRowSelection({})}
            className="ms-2 p-0"
          >
            Limpiar selección
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div style={{ 
        margin: 0, 
        padding: 0, 
        width: '100%',
        minWidth: '100%',
        overflow: 'auto'
      }}>
        <table className="table table-hover mb-0" style={{ 
          width: '100%', 
          minWidth: '100%',
          marginBottom: 0,
          tableLayout: 'fixed'
        }}>
          <thead className="table-light">
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {/* Fila de headers */}
                <tr>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      style={{ 
                        width: header.getSize(),
                        cursor: header.column.getCanSort() ? 'pointer' : 'default'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="d-flex align-items-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ms-1">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                
                {/* Fila de filtros */}
                <tr>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-1">
                      {header.column.getCanFilter() ? (
                        header.column.id === 'Activo' ? (
                          <StatusFilter column={header.column} />
                        ) : (
                          <TextFilter 
                            column={header.column} 
                            placeholder={`Filtrar ${header.column.columnDef.header}...`}
                          />
                        )
                      ) : null}
                    </th>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center text-muted py-4">
                  {isLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Cargando clientes...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                      No se encontraron clientes
                    </>
                  )}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={row.getIsSelected() ? 'table-active' : ''}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} 
            ({table.getFilteredRowModel().rows.length} registros)
          </span>
        </div>
        
        <div className="d-flex gap-1">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            ⏮
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ◀
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ▶
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            ⏭
          </Button>
        </div>
      </div>

      {/* Modal para mostrar el mapa */}
      <Modal show={showMap} onHide={handleCloseMap} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            📍 Ubicación de {selectedClient?.Nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <>
              <div className="mb-3">
                <strong>Cliente:</strong> {selectedClient.Nombre}<br/>
                <strong>Dirección:</strong> {selectedClient.Direccion}<br/>
                <strong>Coordenadas:</strong> {selectedClient.Coordenada_y?.toFixed(6)}, {selectedClient.Coordenada_x?.toFixed(6)}
              </div>
              <div style={{ height: '400px', width: '100%' }}>
                <ClientMapComponent 
                  client={{
                    lat: selectedClient.Coordenada_y,
                    lng: selectedClient.Coordenada_x,
                    nombre: selectedClient.Nombre,
                    direccion: selectedClient.Direccion
                  }}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMap}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdvancedClientTable;
