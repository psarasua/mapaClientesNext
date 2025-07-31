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
import { Button, Badge, ButtonGroup, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

const columnHelper = createColumnHelper();

const AdvancedTruckTable = ({ 
  trucks = [], 
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
      cell: (info) => <span className="badge bg-secondary">{info.getValue() || 'N/A'}</span>,
      size: 80,
      filterFn: 'includesString',
    }),

    // Descripción
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (info) => <strong>{info.getValue() || 'Sin descripción'}</strong>,
      size: 300,
      filterFn: 'includesString',
    }),

    // Fecha de creación
    columnHelper.accessor('created_at', {
      header: 'Fecha Creación',
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString('es-ES') : '-';
      },
      size: 120,
      filterFn: 'includesString',
    }),

    // Fecha de actualización
    columnHelper.accessor('updated_at', {
      header: 'Última Actualización',
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString('es-ES') : '-';
      },
      size: 150,
      filterFn: 'includesString',
    }),

    // Acciones
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const truck = row.original;
        return (
          <ButtonGroup>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Editar camión</Tooltip>}
            >
              <Button
                onClick={() => onEdit(truck)}
                variant="outline-primary"
                size="sm"
                disabled={isLoading || createMutationPending || updateMutationPending}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Eliminar camión</Tooltip>}
            >
              <Button
                onClick={() => onDelete(truck)}
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
      size: 120,
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [onEdit, onDelete, isLoading, createMutationPending, updateMutationPending, deleteMutationPending]);

  // Configuración de la tabla
  const table = useReactTable({
    data: trucks,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Camiones');
    XLSX.writeFile(workbook, `camiones_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [table]);

  const csvData = useMemo(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
  }, [table]);

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
          <Form.Control
            type="text"
            placeholder="Buscar en todas las columnas..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ width: '300px' }}
          />
          
          <Form.Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{ width: 'auto' }}
          >
            {[5, 10, 20, 30, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-success" size="sm" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel me-1"></i>
            Excel
          </Button>
          <CSVLink
            data={csvData}
            filename={`camiones_${new Date().toISOString().split('T')[0]}.csv`}
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
                
                <tr>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-1">
                      {header.column.getCanFilter() ? (
                        <TextFilter 
                          column={header.column} 
                          placeholder={`Filtrar ${header.column.columnDef.header}...`}
                        />
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
                      Cargando camiones...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-truck fs-3 d-block mb-2"></i>
                      No se encontraron camiones
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
    </div>
  );
};

export default AdvancedTruckTable;
