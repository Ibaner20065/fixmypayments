'use client';

import React, { useState } from 'react';
import type { ClassifiedTransaction } from '../lib/classify';

interface TransactionRowProps {
  transaction: ClassifiedTransaction;
  onUpdate: (updatedTransaction: ClassifiedTransaction) => void;
  onDelete: (id: string) => void;
  onShowToast: (message: string) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Medical', 'Entertainment', 'Health', 'Groceries'];

export default function TransactionRow({
  transaction,
  onUpdate,
  onDelete,
  onShowToast,
}: TransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(transaction.category);
  const [editedMerchant, setEditedMerchant] = useState(transaction.merchant);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editedCategory,
          merchant: editedMerchant,
        }),
      });

      if (!res.ok) {
        onShowToast('⚠ FAILED TO UPDATE');
        return;
      }

      const updated = await res.json();
      onUpdate(updated);
      setIsEditing(false);
      onShowToast('✓ TRANSACTION UPDATED');
    } catch (error) {
      onShowToast('⚠ ERROR UPDATING TRANSACTION');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this transaction?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        onShowToast('⚠ FAILED TO DELETE');
        return;
      }

      onDelete(transaction.id);
      onShowToast('✓ TRANSACTION DELETED');
    } catch (error) {
      onShowToast('⚠ ERROR DELETING TRANSACTION');
    } finally {
      setIsLoading(false);
    }
  };

  const CATEGORY_EMOJIS: Record<string, string> = {
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Utilities: '⚡',
    Medical: '🏥',
    Entertainment: '🎬',
    Health: '💪',
    Groceries: '🛒',
  };

  const emoji = CATEGORY_EMOJIS[transaction.category] || '📝';

  if (isEditing) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '2px solid #CCFF00',
          padding: '16px',
          marginBottom: 12,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 150px 150px',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={editedMerchant}
          onChange={(e) => setEditedMerchant(e.target.value)}
          style={{
            border: '2px solid #000',
            padding: '8px 12px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
          }}
          disabled={isLoading}
        />

        <select
          value={editedCategory}
          onChange={(e) => setEditedCategory(e.target.value)}
          style={{
            border: '2px solid #000',
            padding: '8px 12px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
          }}
          disabled={isLoading}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            background: '#CCFF00',
            border: '2px solid #000',
            padding: '8px 12px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          SAVE
        </button>

        <button
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
          style={{
            background: '#FFFFFF',
            border: '2px solid #000',
            padding: '8px 12px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '2px solid #000',
        padding: '16px',
        marginBottom: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 150px 80px 80px',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#000',
          }}
        >
          {emoji} {transaction.merchant}
        </div>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.65rem',
            color: '#475569',
            marginTop: 4,
          }}
        >
          {new Date(transaction.date).toLocaleDateString()}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#CCFF00',
          }}
        >
          ₹{transaction.amount}
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6rem',
            color: '#475569',
            marginTop: 2,
          }}
        >
          {transaction.category}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: transaction.confidence >= 0.8 ? '#00BB00' : '#FF9900',
            fontWeight: 700,
          }}
        >
          {(transaction.confidence * 100).toFixed(0)}% CONFIDENCE
        </div>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        style={{
          background: '#CCFF00',
          border: '2px solid #000',
          padding: '8px 12px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        EDIT
      </button>

      <button
        onClick={handleDelete}
        disabled={isLoading}
        style={{
          background: '#FFFFFF',
          border: '2px solid #FF3333',
          color: '#FF3333',
          padding: '8px 12px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        DELETE
      </button>
    </div>
  );
}
