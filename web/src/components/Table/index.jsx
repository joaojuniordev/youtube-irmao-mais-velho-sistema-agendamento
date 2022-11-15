// import { useState } from "react"
import { Table } from "rsuite"
import "./Table.css"
import styles from "./Table.module.css"

const { Column, HeaderCell, Cell } = Table


const MyTable = (props) => {
    let { loading, data, config, actions, onRowClick, style } = props
    console.log('MyTable ... #### ', loading, data, style)

    //MUDAR DE _ID PARA ID:
    data = data.map((item)=>({ ...item, id:(item._id||item.id) }))

    // const [autoHeight, setAutoHeight] = useState(true)

    return (
        <Table className={styles.table} style={style} 
        loading={loading}
        height={config.main.style.height}
        data={data}
        // autoHeight={autoHeight}
        rowExpandedHeight={440}
        onRowClick={onRowClick}>
        {   
            config.header.map(({label, fixed, style},i) => (
                <Column key={`${i}`} flexGrow={style.width ? 0:1} width={style.width} align={style.align} fixed={fixed}>
                    <HeaderCell >{label.toLocaleUpperCase()}</HeaderCell>
                    <Cell dataKey={label} />
                </Column>
            ))       
        }
            <Column width={100} fixed="right" >
                <HeaderCell>...</HeaderCell>
                <Cell style={{padding:'0px'}}>{actions}</Cell>
            </Column>
        </Table>
    )
}


export default MyTable
