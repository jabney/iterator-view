import { runScenes } from './demo-utils'

type Scene = any
type Screen = () => Promise<void>

/**
 * This is probably not something managed by the user, but a lib class
 * with a few public methods for starting the presentaion, etc.
 */
function Presenter(mgr: typeof SceneManager) {
    const newController = { add(s: Scene) {} }

    const ctrl = mgr(newController)
    //
    // get ctrl prepaired by scene manager and run it.
}

function SceneManager(ctrl: { add(s: Scene): void }) {
    //
    // Either take an array arg, or return an add function/interface, or both.
    //
    // Scenes should be awaitable.
    // Do setup, like screen clearing, whatever.
    //
    // Execute the scenes in order
    //
    // Need a mechanism for calling start internally.
    //

    // return {
    //     start: () => runScenes(scenes),
    //     onStart: (handler: () => void) => {
    //         sceneStart = handler
    //     },
    //     onEnd: (handler: () => void) => {
    //         sceneEnd = handler
    //     },
    // }
    return ctrl
}

//
// Scene: a collection of screens and a script to run them.
//
// Screen: a collection of panels, content.
//
// Panel: a window buiding block like text, marquee, unfolder, whatever.
//

function sceneIntro(ctrl: { add(s: Screen): void; onInput(fn: () => void): void }): Scene {
    //
    // Figure out what (if anything) to inject here, .e.g, input receiver.
    // Splash or intro screen (screen might be a good noun for a panel with content, etc.)
    //
    // Intro screen 2, etc.
    //
    // Slide 1
    //
    // Slide 2
    //
    // Slide 3 code demo
    //
    // End scene, transition to next screen logic, if any.
    ctrl.add(/* scene 1 */ () => new Promise<void>(() => {}))
    ctrl.add(/* scene 2 */ () => new Promise<void>(() => {}))
    ctrl.add(/* scene 3 */ () => new Promise<void>(() => {}))

    return ctrl
}

export { SceneManager }
