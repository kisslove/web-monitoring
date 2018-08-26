import { animate, state, style, transition, trigger, keyframes } from '@angular/animations';

// Component transition animations
export const slideInDownAnimation =
    trigger('routeAnimation', [
        state('in', style({ transform: 'rotateX(0)' })),
        transition('void => *', [
            animate(300, keyframes([ // 回弹的效果
                style({ opacity: 0, transform: 'rotateX(90deg)' }),
                style({ opacity: 1, transform: 'rotateX(45deg)' }),
                style({ opacity: 1, transform: 'rotateX(0)' })
            ]))
        ])
    ]);

export const slideInDownAnimation1 =
    trigger('routeAnimation1', [
        state('*',
            style({
                opacity: 1,
                // transform: 'translateY(0%)'
            })
        ),
        transition(':enter', [
            style({
                opacity: 0.5,
                // transform: 'translateY(50%)'
            }),
            animate('.6s ease-in')
        ])
    ]);