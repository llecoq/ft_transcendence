import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { ListChildComponentProps, FixedSizeList } from 'react-window';

function renderRow(props: ListChildComponentProps) {
	const { index, style} = props;
	
	return (
		<ListItem style={style} key={index} component="div" disablePadding>
			<ListItem>
				<ListItemText primary={`Item ${index + 1}`} />
			</ListItem>
		</ListItem>
	);
}

export default function VirtualizedList({ height, itemCount}) {

	return (
		<FixedSizeList
			height={height}
			width={"100%"}
			itemSize={46}
			itemCount={itemCount}
			overscanCount={5}
		>
			{renderRow}
		</FixedSizeList>
	);
}