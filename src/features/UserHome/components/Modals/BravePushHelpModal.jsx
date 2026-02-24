import { Fragment } from "react"
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from "@headlessui/react"

export default function BravePushHelpModal({ open, onClose }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Enable Push Notifications in Brave
              </DialogTitle>

              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <p>
                  To receive match alerts, Brave requires Google push
                  messaging to be enabled.
                </p>

                <ol className="list-decimal list-inside space-y-1">
                  <li>Open brave://settings/privacy</li>
                  <li>Enable “Use Google services for push messaging”</li>
                  <li>Restart Brave browser</li>
                </ol>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-pink-700 transition"
                >
                  Got it
                </button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}