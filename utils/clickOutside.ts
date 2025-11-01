import type { DirectiveBinding } from 'vue'

type ClickOutsideEl = HTMLElement & {
    __clickOutside__?: (event: MouseEvent) => void
    __escHandler__?: (event: KeyboardEvent) => void
}

export default {
    beforeMount(el: ClickOutsideEl, binding: DirectiveBinding) {
        el.__clickOutside__ = (event: MouseEvent) => {
            if (!(el === event.target || el.contains(event.target as Node))) {
                binding.value(event)
            }
        }

        el.__escHandler__ = (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                binding.value(event)
            }
        }

        document.addEventListener('click', el.__clickOutside__)
        document.addEventListener('keydown', el.__escHandler__)
    },

    unmounted(el: ClickOutsideEl) {
        if (el.__clickOutside__) {
            document.removeEventListener('click', el.__clickOutside__)
        }
        if (el.__escHandler__) {
            document.removeEventListener('keydown', el.__escHandler__)
        }
        delete el.__clickOutside__
        delete el.__escHandler__
    },
}