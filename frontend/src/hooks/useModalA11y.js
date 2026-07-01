import { useEffect, useRef } from 'react';

/**
 * Hook to manage accessibility (a11y) inside modals.
 * Implements a focus trap, focuses on cancel/close button upon opening,
 * and handles closing the modal when the Escape key is pressed.
 *
 * @param {boolean} isOpen - Indicates if the modal is currently open.
 * @param {Function} onClose - Function to call when the modal should be closed (e.g., via Escape key).
 * @returns {{ modalRef: React.MutableRefObject, cancelBtnRef: React.MutableRefObject }}
 */
export function useModalA11y(isOpen, onClose) {
	const modalRef = useRef(null);
	const cancelBtnRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				if (onClose) onClose();
				return;
			}

			if (e.key === 'Tab') {
				if (!modalRef.current) return;

				const focusableElements = modalRef.current.querySelectorAll(
					'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
				);

				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		// Automatically focus on the cancel button (or the modal container itself) when opening
		if (cancelBtnRef.current) {
			cancelBtnRef.current.focus();
		} else if (modalRef.current) {
			modalRef.current.focus();
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	return { modalRef, cancelBtnRef };
}
