#!/bin/sh
cat \
    version.js \
    MW_Config.js \
	util/ajax.js \
    util/widgets.js \
	grid/ItemContainer.js \
	grid/ViewItemContainer.js \
	grid/GridModel.js \
	grid/GridContents.js \
	grid/GridItem.js \
	grid/GridViewItem.js \
	grid/GridViewContents.js \
	grid/GridView.js \
	grid/ContentFactory.js \
	grid/LitGridModel.js \
	grid/LitGridContents.js \
	grid/LitGridItem.js \
	grid/LitGridViewItem.js \
	grid/LitGridViewContents.js \
	grid/LitGridView.js \
	grid/LitContentFactory.js \
	grid/ShadowElement.js \
	grid/HexGridModel.js \
	grid/HexGridView.js \
	grid/RectGridModel.js \
	grid/RectGridView.js \
	grid/PerspectiveGridModel.js \
	grid/PerspectiveGridContents.js \
	grid/PerspectiveGridItem.js \
	grid/PerspectiveGridView.js \
	grid/PerspectiveGridViewContents.js \
	grid/PerspectiveGridViewItem.js \
	grid/BlockGridViewItem.js \
	grid/SimpleBlockGridViewItem.js \
	grid/StateDirectionShadowElement.js \
	grid/StateGridViewItem.js \
	grid/SelectableViewItem.js \
	grid/PerspectiveItemFactory.js \
	ACItemHandler.js \
	actions/GameAction.js \
	actions/ActionController.js \
	actions/ActionSummary.js \
	actions/HeightActionSummary.js \
	actions/SpeechActionSummary.js \
	actions/TeleportActionSummary.js \
	actions/MoveActionSummary.js \
	actions/ItemViewSelector.js \
	actions/ActionEditor.js \
	actions/SpeechActionEditor.js \
	actions/MoveActionEditor.js \
	actions/HeightActionEditor.js \
	actions/TeleportActionEditor.js \
	actions/ActionViewWindow.js \
	conditions/GameCondition.js \
	conditions/ConditionSummary.js \
	conditions/TimestampConditionSummary.js \
	conditions/WeightConditionSummary.js \
	conditions/HasItemConditionSummary.js \
	conditions/ConditionEditor.js \
	conditions/TimestampConditionEditor.js \
	conditions/WeightConditionEditor.js \
	conditions/HasItemConditionEditor.js \
	ui/ContentLayoutView.js \
	ui/LoginController.js \
	ui/SummaryItemDisplay.js \
	ui/ItemSelectorWindow.js \
	ui/BlockItemWindow.js \
	ui/ItemWindow.js \
	ui/LightLevelWindow.js \
	ui/EditWindow.js \
	ui/TextEditWindow.js \
	ui/AdminWindow.js \
	ui/WorldChooserWindow.js \
	ui/AvatarController.js \
	ui/AvatarGroupController.js \
	ui/InventoryWindow.js \
	ui/GameServerInterface.js \
	gameController.js \
	mapGame.js \
    > mw.js