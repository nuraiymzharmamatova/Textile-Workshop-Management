import React from 'react';
import { FiInbox } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function EmptyState({ message }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <FiInbox size={48} className="mb-4" />
      <p className="text-lg">{message || t('common.noData')}</p>
    </div>
  );
}
