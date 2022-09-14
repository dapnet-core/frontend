import { defineComponent, h, VNode } from 'vue'
import DataTable from 'components/DataTable.vue'
import { QTableColumn } from 'quasar'

export interface Props<RowType> {
  title: string
  cols: QTableColumn<RowType>[]
  loadDataFunction:() => Promise<readonly RowType[]>
  rowKey: keyof RowType
}

/** Generic version of quasar/dist/types/index.d.ts:10536 */
type TableCell<RowType, Cell extends keyof RowType> = {
  /**
   * Column definition for column associated with table cell
   */
  col: QTableColumn<RowType>;
  /**
   * Parsed/Formatted value of table cell
   */
  value: RowType[Cell];
  /**
   * Row's key
   */
  key: keyof RowType;
  /**
   * Row object
   */
  row: RowType;
  /**
   * Row's index (0 based) in the filtered and sorted table
   */
  rowIndex: number;
  /**
   * Row's index (0 based) in the current page of the filtered and sorted table
   */
  pageIndex: number;
  /**
   * Column definitions
   */
  cols: QTableColumn<RowType>[];
  /**
   * Column mapping (key is column name, value is column object)
   */
  colsMap: Record<string, QTableColumn<RowType>>;
  /**
   * Trigger a table sort
   * @param col Column name or column definition object
   */
  sort: (col: string | QTableColumn<RowType>) => void;
  /**
   * (Only if using selection) Is row selected? Can directly be assigned new Boolean value which changes selection state
   */
  selected: boolean;
  /**
   * Is row expanded? Can directly be assigned new Boolean value which changes expanded state
   */
  expand: boolean;
  /**
   * Color name for component from the Quasar Color Palette
   */
  color: string;
  /**
   * Notify the component that the background is a dark color
   */
  dark: boolean;
  /**
   * Dense mode; occupies less space
   */
  dense: boolean;
}

// Wrap the DataTable component in a genericly-typed wrapper
// Adapted from https://logaretm.com/blog/generic-type-components-with-composition-api/
export function useGenericTable<RowType> () {
  const wrapper = defineComponent((props: Props<RowType>, { slots }) => {
    // Returning functions in `setup` means this is the render function
    return () => h(DataTable, props, slots)
  })
  // Cast the wrapper as itself so we do not lose existing component type information
  return wrapper as typeof wrapper & {
    // we augment the wrapper type with a constructor type that overrides/adds
    // the slots type information by adding a `$slots` object with slot functions defined as properties
    new (): {
      $slots: {
        // each function correspond to a slot and its arguments are the slot props available
        // it should return an array of `VNode`
        [K in keyof RowType]: (arg: TableCell<RowType, K>) => VNode[];
      };
    };
  }
}
