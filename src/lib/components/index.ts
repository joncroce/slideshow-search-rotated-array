import Code from './code.svelte';
import FitText from './fit.svelte';
import Markdown from './markdown.svelte';
import Media from './media.svelte';
import Notes from './notes.svelte';
import Presentation from './presentation.svelte';
import Slide from './slide.svelte';
import Stack from './stack.svelte';
import Step from './step.svelte';
import Stretch from './stretch.svelte';
import Vertical from './vertical.svelte';

import CircleArray from './CircleArray.svelte';
import AnimationProgress from './AnimationProgress.svelte';
import SearchState from './SearchState.svelte';
import AnimationControl from './AnimationControl.svelte';
import SearchAnimationSlide from './SearchAnimationSlide.svelte';
import Spinner from './Spinner.svelte';

import {
	Button,
	NumberInput,
	ProgressIndicator,
	ProgressStep,
	TooltipDefinition,
} from 'carbon-components-svelte';
import {
	PlayFilled as IconPlay,
	PauseFilled as IconPause,
	Search as IconSearch,
	WarningHexFilled as IconWarning,
	Return as IconReturn,
	LogoMastodon,
	LogoGithub,
	LogoLinkedin,
} from 'carbon-icons-svelte';

export {
	Code,
	FitText,
	Markdown,
	Media,
	Notes,
	Presentation,
	Slide,
	Stack,
	Step,
	Stretch,
	Vertical,
	// own components
	CircleArray,
	AnimationProgress,
	SearchState,
	AnimationControl,
	SearchAnimationSlide,
	Spinner,
	// carbon components
	Button,
	NumberInput,
	ProgressIndicator,
	ProgressStep,
	TooltipDefinition,
	// carbon icons
	IconWarning,
	IconPlay,
	IconPause,
	IconSearch,
	IconReturn,
	LogoMastodon,
	LogoGithub,
	LogoLinkedin,
};
