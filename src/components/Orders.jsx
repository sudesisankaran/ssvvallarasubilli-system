import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate, ORDER_STAGES } from '../utils/constants';
import {
  Search,
  Clock,
  Phone,
  Tag,
  ArrowRight,
  Inbox,
  Palette,
  PenTool,
  Printer,
  CheckCircle,
  Truck,
  CheckCheck
} from 'lucide-react';

const STAGE_ICONS = {
  'Order Received': Inbox,
  'Design Pending': Palette,
  'Designing': PenTool,
  'Printing': Printer,
  'Quality Check': CheckCircle,
  'Ready for Delivery': Truck,
  'Delivered': CheckCheck
};

export default function Orders() {
  const {
    invoices,
    updateOrderStatus,
    setViewingInvoice
  } = useShop();

  const [search, setSearch] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = invoices.filter(inv => {
    return !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(search));
  });

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="card-custom mb-3">
        <div className="card-body-custom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 className="mb-0 fs-5 fw-bold text-dark">Production &amp; Order Pipeline</h2>
            <small className="text-muted">Track order status from Design Pending to Printing and Delivery</small>
          </div>
          <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by invoice / customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {ORDER_STAGES.map(stage => {
          const stageInvoices = filtered.filter(i => (i.orderStatus || 'Order Received') === stage.id);
          const Icon = STAGE_ICONS[stage.id] || Inbox;

          return (
            <div key={stage.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-title" style={{ color: stage.color }}>
                  <Icon size={16} />
                  <span>{stage.title}</span>
                </div>
                <span className="kanban-count">{stageInvoices.length}</span>
              </div>

              <div className="kanban-cards-container">
                {stageInvoices.length === 0 ? (
                  <div className="text-center py-4 text-muted small fst-italic">
                    No orders at this stage
                  </div>
                ) : (
                  stageInvoices.map(inv => {
                    const isDueToday = inv.deliveryDate === todayStr;
                    const isOverdue = inv.deliveryDate && inv.deliveryDate < todayStr && inv.orderStatus !== 'Delivered';
                    const itemsBrief = (inv.items || [])
                      .map(i => `${i.quantity}x ${i.serviceName}`)
                      .slice(0, 2)
                      .join(', ');

                    return (
                      <div
                        key={inv.id}
                        className="kanban-card cursor-pointer"
                        onClick={() => setViewingInvoice(inv)}
                      >
                        <div className="kanban-card-header">
                          <span className="kanban-inv-num">{inv.invoiceNumber}</span>
                          <span className={`badge ${inv.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : (inv.paymentStatus === 'Partial' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger')} small py-0`}>
                            {inv.paymentStatus}
                          </span>
                        </div>

                        <div className="kanban-customer">{inv.customerName}</div>
                        <div className="small text-muted mb-2">
                          <Phone size={11} className="d-inline me-1" />{inv.customerPhone || 'N/A'}
                        </div>

                        <div className="kanban-items">
                          <Tag size={11} className="d-inline text-primary me-1" />{itemsBrief || 'Custom Job'}
                        </div>

                        {inv.deliveryDate && (
                          <div className="mb-2">
                            <span className={`badge ${isOverdue ? 'bg-danger text-white' : (isDueToday ? 'bg-warning text-dark' : 'bg-light text-muted border')} small`}>
                              <Clock size={10} className="d-inline me-1" />Due: {formatDate(inv.deliveryDate)}
                            </span>
                          </div>
                        )}

                        <div
                          className="kanban-card-footer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="fw-bold text-dark">{formatCurrency(inv.grandTotal)}</span>
                          <select
                            className="form-select form-select-sm py-0 px-2 w-auto small"
                            style={{ fontSize: '0.75rem' }}
                            value={inv.orderStatus}
                            onChange={(e) => updateOrderStatus(inv.id, e.target.value)}
                          >
                            {ORDER_STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.id}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

