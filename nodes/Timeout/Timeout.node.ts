import {IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType} from 'n8n-workflow';

const MAX_TIMEOUT = 2147483647;

interface TimeoutExecution {
	timer: NodeJS.Timeout,
	executionId: string
	resolve: (value: INodeExecutionData[][]) => void
}

export class Timeout implements INodeType {
	private static history: Map<string, TimeoutExecution> = new Map();

	description: INodeTypeDescription = {
		displayName: 'Timeout',
		name: 'timeout',
		icon: { light: 'file:stopwatch.light.svg', dark: 'file:stopwatch.dark.svg' },
		group: ['flow'],
		version: 1,
		description: 'Resume execution if not triggered again or cancelled within a given timeout',
		defaults: {
			name: 'Timeout',
		},
		inputs: [NodeConnectionType.Main, NodeConnectionType.Main],
		inputNames: ['Trigger', 'Cancel'],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 1,
				description: 'Timeout after which the item proceeds to the output (in seconds)',
			},
			{
				displayName: 'Unit',
				name: 'unit',
				type: 'options',
				options: [
					{
						name: 'Seconds',
						value: 'seconds',
					},
					{
						name: 'Minutes',
						value: 'minutes',
					},
					{
						name: 'Hours',
						value: 'hours',
					},
					{
						name: 'Days',
						value: 'days',
					},
				],
				default: 'seconds',
				description: 'Unit of the timeout value',
			},
			{
				displayName: 'Scope',
				name: 'scope',
				type: 'string',
				placeholder: '<default>',
				default: '',
				description: 'Optional scope for event matching',
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const nodeId = this.getNode().id;
		const unit = this.getNodeParameter('unit', 0) as string;

		let waitMS = this.getNodeParameter('timeout', 0) as number;
		const triggerInputData = this.getInputData(0);
		const cancelInputData = this.getInputData(1);

		const activeExecution = Timeout.history.get(nodeId);

		if (activeExecution) {
			clearTimeout(activeExecution.timer);
			activeExecution.resolve([]);
			if (cancelInputData.length) return [];
		}

		if (unit === 'minutes') {
			waitMS *= 60;
		}
		if (unit === 'hours') {
			waitMS *= 60 * 60;
		}
		if (unit === 'days') {
			waitMS *= 60 * 60 * 24;
		}

		waitMS *= 1000;
		if (waitMS > MAX_TIMEOUT) {
			return [];
		}

		return await new Promise((resolve) => {
			const timer = setTimeout(() => resolve([triggerInputData]), waitMS);
			this.onExecutionCancellation(() => clearTimeout(timer));
			Timeout.history.set(nodeId, {
				timer,
				resolve,
				executionId: this.getExecutionId()
			})
		})
	}
}
