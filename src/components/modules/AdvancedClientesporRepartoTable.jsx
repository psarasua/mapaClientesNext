'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import {
  Table,
  Form,
  Button,
  Row,
  Col,
  Badge,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Spinner
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';

const columnHelper = createColumnHelper();

const AdvancedClientesporRepartoTable = ({ 
  data = [], 
  onEdit, 
  onDelete, 
  isLoading = false, 
  deletingId = null 
}) => {
  // Estados para filtros y selección
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Definición de columnas
  const columns = useMemo(
    () => [
      // Columna de selección
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Form.Check
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Form.Check
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
      }),
      
      // Columna ID
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => (
          <Badge bg="primary">{row.original.id || 'N/A'}</Badge>
        ),
        size: 80,
        filterFn: 'includesString',
      }),
      
      // Columna Día de Entrega
      columnHelper.accessor('dia_descripcion', {
        header: 'Día de Entrega',
        cell: ({ row }) => (
          <Badge bg="info">{row.original.dia_descripcion || 'N/A'}</Badge>
        ),
        size: 140,
        filterFn: 'includesString',
      }),
      
      // Columna Camión
      columnHelper.accessor('camion_descripcion', {
        header: 'Camión',
        cell: ({ row }) => (
          <Badge bg="success">{row.original.camion_descripcion || 'N/A'}</Badge>
        ),
        size: 140,
        filterFn: 'includesString',
      }),
      
      // Columna Cliente
      columnHelper.accessor('cliente_nombre', {
        header: 'Cliente',
        cell: ({ row }) => (
          <div className="fw-medium">{row.original.cliente_nombre || 'N/A'}</div>
        ),
        filterFn: 'includesString',
      }),
      
      // Columna Razón Social
      columnHelper.accessor('cliente_razonsocial', {
        header: 'Razón Social',
        cell: ({ row }) => (
          <div>{row.original.cliente_razonsocial || 'N/A'}</div>
        ),
        filterFn: 'includesString',
      }),
      
      // Columna Dirección
      columnHelper.accessor('cliente_direccion', {
        header: 'Dirección',
        cell: ({ row }) => (
          <div className="text-truncate" style={{ maxWidth: '200px' }} title={row.original.cliente_direccion}>
            {row.original.cliente_direccion || 'N/A'}
          </div>
        ),
        filterFn: 'includesString',
      }),
      
      // Columna Teléfono
      columnHelper.accessor('cliente_telefono', {
        header: 'Teléfono',
        cell: ({ row }) => (
          <div>{row.original.cliente_telefono || 'N/A'}</div>
        ),
        size: 120,
        filterFn: 'includesString',
      }),
      
      // Columna RUT
      columnHelper.accessor('cliente_rut', {
        header: 'RUT',
        cell: ({ row }) => (
          <div>{row.original.cliente_rut || 'N/A'}</div>
        ),
        size: 120,
        filterFn: 'includesString',
      }),
      
      // Columna Fecha de creación
      columnHelper.accessor('created_at', {
        header: 'Creado',
        cell: ({ row }) => {
          const date = row.original.created_at;
          if (!date) return <span className="text-muted">-</span>;
          
          try {
            const formattedDate = new Date(date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            return <small className="text-muted">{formattedDate}</small>;
          } catch (error) {
            return <span className="text-muted">-</span>;
          }
        },
        size: 130,
        filterFn: 'includesString',
      }),
      
      // Columna Acciones
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <ButtonGroup size="sm">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Editar asignación</Tooltip>}
            >
              <Button
                onClick={() => onEdit?.(row.original)}
                variant="outline-warning"
                disabled={isLoading}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Eliminar asignación</Tooltip>}
            >
              <Button
                onClick={() => onDelete?.(row.original.id)}
                variant="outline-danger"
                disabled={isLoading}
              >
                {deletingId === row.original.id ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="bi bi-trash"></i>
                )}
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
        ),
        size: 120,
      }),
    ],
    [onEdit, onDelete, isLoading, deletingId]
  );

  // Configuración de la tabla
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes por Reparto');
    
    const fileName = `clientes_reparto_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [table]);

  const prepareCSVData = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
    
    return dataToExport.map(item => ({
      ID: item.id || '',
      'Día de Entrega': item.dia_descripcion || '',
      Camión: item.camion_descripcion || '',
      Cliente: item.cliente_nombre || '',
      'Razón Social': item.cliente_razonsocial || '',
      Dirección: item.cliente_direccion || '',
      Teléfono: item.cliente_telefono || '',
      RUT: item.cliente_rut || '',
      Creado: item.created_at || ''
    }));
  }, [table]);

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div>
      {/* Controles superiores */}
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-bold">Búsqueda global</Form.Label>
            <Form.Control
              type="text"
              placeholder="Buscar en todos los campos..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={8} className="text-end">
          <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
            {selectedRowsCount > 0 && (
              <Badge bg="info" className="px-3 py-2">
                {selectedRowsCount} de {totalRowsCount} seleccionados
              </Badge>
            )}
            
            <ButtonGroup>
              <Button
                variant="success"
                size="sm"
                onClick={exportToExcel}
                disabled={totalRowsCount === 0}
              >
                <i className="bi bi-file-earmark-excel me-1"></i>
                Excel
              </Button>
              
              <CSVLink
                data={prepareCSVData()}
                filename={`clientes_reparto_${new Date().toISOString().split('T')[0]}.csv`}
                className="btn btn-outline-success btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <i className="bi bi-file-earmark-text me-1"></i>
                CSV
              </CSVLink>
            </ButtonGroup>
            
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setRowSelection({});
                setGlobalFilter('');
                setColumnFilters([]);
                setSorting([]);
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Tabla */}
      <div className="table-responsive" style={{ width: '100%' }}>
        <Table hover className="align-middle">
          <thead className="table-light">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ 
                      width: header.getSize(), 
                      minWidth: header.getSize(),
                      cursor: header.column.getCanSort() ? 'pointer' : 'default'
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="d-flex flex-column">
                      <div className="d-flex align-items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ms-1">
                            {header.column.getIsSorted() === 'asc' ? (
                              <i className="bi bi-arrow-up text-primary"></i>
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <i className="bi bi-arrow-down text-primary"></i>
                            ) : (
                              <i className="bi bi-arrow-down-up text-muted"></i>
                            )}
                          </span>
                        )}
                      </div>
                      
                      {/* Filtro por columna */}
                      {header.column.getCanFilter() && header.id !== 'select' && header.id !== 'actions' && (
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder={`Filtrar ${header.column.columnDef.header}`}
                          value={(header.column.getFilterValue() ?? '')}
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          className="mt-1"
                          style={{ minWidth: '120px' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5">
                  <div className="text-muted">
                    <i className="bi bi-people-fill display-4 d-block mb-3"></i>
                    <h5>No hay asignaciones</h5>
                    <p>No se encontraron asignaciones de clientes que coincidan con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Controles de paginación */}
      <Row className="mt-3 align-items-center">
        <Col md={6}>
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              size="sm"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {[5, 10, 20, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} filas
                </option>
              ))}
            </Form.Select>
            <span className="text-muted">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} de{' '}
              {table.getFilteredRowModel().rows.length} resultados
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-end gap-1">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <i className="bi bi-chevron-double-left"></i>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            <span className="btn btn-outline-secondary btn-sm disabled">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <i className="bi bi-chevron-double-right"></i>
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedClientesporRepartoTable;
