import { defineComponent, h, VNode } from 'vue'
import DataTable from 'components/DataTable.vue'
import { QTableColumn } from 'quasar'

type Merge<T, R extends Record<string, unknown>> = Omit<T, keyof R> & R

/** Generic version of quasar/dist/types/index.d.ts:9908 */
export type Column<
  RowType extends Record<string, unknown>,
  Field = keyof RowType,
  ValueType = Field extends keyof RowType ? RowType[Field] : never
> = Merge<QTableColumn<RowType>, {
  name?: string
  field: Field
  sort?: (a: ValueType, b: ValueType, rowA: RowType, rowB: RowType) => number
  format?: (val: ValueType, row: RowType) => string
  style?: string | ((row: RowType) => string)
  classes?: string | ((row: RowType) => string)
}>

export interface Props<RowType extends Record<string, unknown>, Cols> {
  title: string
  cols: Cols
  loadDataFunction:() => Promise<readonly RowType[]>
  rowKey: keyof RowType
}

/** Generic version of quasar/dist/types/index.d.ts:10536 */
export type TableCell<
  RowType extends Record<string, unknown>,
  Col extends Column<RowType>,
  ValueType = Col extends Column<RowType, any, infer V> ? V : never
> = {
  /**
   * Column definition for column associated with table cell
   */
  col: Col;
  /**
   * Parsed/Formatted value of table cell
   */
  value: ValueType;
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
export function useGenericTable<RowType extends Record<string, unknown>, Cols extends Record<string, Column<RowType, string, any>>> () {
  const wrapper = defineComponent((props: Props<RowType, Cols>, { slots }) => {
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
        [name in keyof Cols]: (arg: TableCell<RowType, Cols[name]>) => VNode[];
      };
    };
  }
}
