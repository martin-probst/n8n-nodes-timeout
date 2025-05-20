# n8n-nodes-timeout

This is an n8n community node. It lets you use _Timeout_ nodes in your n8n workflows. Useful in home automation flows.

The timeout node takes incoming events from the trigger input and delays them for a given period of time. But unlike the
_Wait_ node, whenever a new event arrives within the waiting period, the timeout of the previous execution is cancelled
and it will stop without emitting an event to subsequent nodes.

## Use-cases
Timeout nodes are especially useful in home-automation if you want to observe interruptions in an event stream.
Consider a sensor which reports its measurements regularly via a webhook. If the sensor stops transmitting (low battery,
lost network connection) for some time, you can detect this failure and notify the user about it.

A different use-case is to turn something on (a light, a pump) for a certain duration and have it turned off automatically.
While this could also be achieved with a simple _Wait_ node (turn on -> wait -> turn off), you can get into trouble if this
workflow is triggered again before an earlier execution has finished.
[!Screenshot of a workflow which uses a Timout node to control auto-off of an actuator](./Actuator_TO.png)

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

_List the operations supported by your node._

## Compatibility

_State the minimum n8n version, as well as which versions you test against. You can also include any known version incompatibility issues._

## Usage

Connect the flow of an event source (usually a _Webhook_) to the _Trigger_ input of the _Timeout_ node. If you need events
to cancel the timeout altogether without triggering a new timeout, connect these event to the _Cancel_ input. This could be
events from an _If_ branch or from a different source (like a second _Webhook_).
It is totally fine to leave the _Cancel_ input unconnected, e.g. if you only want to detect the disruption of incoming events.

If you have an event stream of similar events (e.g. multiple sensors), you can use a unique id from their payload (sensor id)
in the optional _scope_ parameter. This will trigger independent timeouts for each unique scope.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
