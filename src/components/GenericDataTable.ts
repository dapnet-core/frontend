import { defineComponent, h, VNode } from 'vue'
import DataTable from 'components/DataTable.vue'
import { QTableColumn } from 'quasar'
import { PaginationHandler, PaginationProps } from 'src/api/pagination'

/** Merge two types; Information from the right side is used if there is a conflict */
type Merge<T, R extends Record<string, unknown>> = Omit<T, keyof R> & R

/**
 * Column type. It is advised to type it explicitly with string literals as Field so type inference works as expected:
 *
 * `const col: Column<DataType, 'myField'> = { ... }`
 *
 * *Generic version of QTableColumn*
 */
export type Column<
  RowType extends Record<string, unknown>,
  Field = keyof RowType | ((row: RowType) => unknown),
  ValueType = Field extends keyof RowType ? RowType[Field] : (Field extends (row: RowType) => infer T ? T : never)
> = Merge<Omit<QTableColumn<RowType>, 'name'>, {
  /**
   * Row Object property to determine value for this column; Either a key of the row type, or a
   * function taking in one row and returning any value. If this value is not primitive, you have
   * to provide your own cell implementation or use a formatting function
   */
  field: Field
  /**
   * Compare function if you have some custom data or want a specific way to compare two rows
   * @param a Value of the first comparison term
   * @param b Value of the second comparison term
   * @param rowA Full Row object in which is contained the first term
   * @param rowB Full Row object in which is contained the second term
   * @returns Comparison result of term 'a' with term 'b'. Less than 0 when 'a' should come first; greater than 0 if 'b' should come first; equal to 0 if their position must not be changed with respect to each other
   */
  sort?: (a: ValueType, b: ValueType, rowA: RowType, rowB: RowType) => number
  /**
   * Function you can apply to format your data
   * @param val Value of the cell
   * @param row Full Row object in which the cell is contained
   * @returns The resulting formatted value
   */
  format?: (val: ValueType, row: RowType) => string
  /**
   * Style to apply on normal cells of the column
   * @param row The current row being processed
   */
  style?: string | ((row: RowType) => string)
  /**
   * Classes to add on normal cells of the column
   * @param row The current row being processed
   */
  classes?: string | ((row: RowType) => string)
}>

export interface Props<RowType extends Record<string, unknown>, Cols extends Record<string, Column<RowType>>> {
  /**
   * Title of this table
   */
  title: string
  /**
   * Column definition. Is is advised to statically type this
   */
  cols: Cols
  /**
   * Called on mount of this component to supply all available data to the table.
   * This is an async function; Until it is resolved, a loading animation will play
   */
  loadDataFunction?:() => Promise<readonly RowType[]>
  /**
   * Called each time new data is required. Implies server-side pagination. If set, loadDataFunction will be ignored.
   */
  loadPaginatedData?: PaginationHandler<RowType>
  /**
   * Overwrite default pagination
   */
  defaultPagination? : PaginationProps<RowType>
  /**
   * Property name of row type that defines the unique key for each row
   */
  uniqueRowKey: keyof RowType
}

/** *Generic version of quasar/dist/types/index.d.ts:10536* */
export type TableCell<
  RowType extends Record<string, unknown>,
  Col extends Column<RowType>,
  ValueType = Col extends Column<RowType, unknown, infer V> ? V : never
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

/**
 * Wrap the DataTable component in a generically-typed wrapper that gives full type support
 * to templates, data loading callbacks and more.
 *
 * ## Usage
 *
 * Define the wrapper component somewhere in your setup function
 *
 * `const myGenericTable = useGenericTable<myRowDataType, myColumns>()`
 *
 * and then you can use it in your template like so
 *
 * `<MyGenericTable :cols="..." ... />`
 *
 * ## Slots
 * - `cell-{colName}`, where *colName* is a name of the defined columns. Overwrites the render function for this specific column. Equivalent to QTable `body-cell-{colName}`, except that we don't have to wrap out code in `<q-td>`. Props are of type `TableCell<RowType, Column>`
 */
// Adapted from https://logaretm.com/blog/generic-type-components-with-composition-api/
export function useGenericTable<
  RowType extends Record<string, unknown>,
  // This must be any, otherwise the index signature doesn't work
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cols extends Record<string, Column<RowType, any, any>>
> () {
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
        // each function correspond to a slot and its arguments are the slot props available; it should return an array of `VNode`

        // Slot 'cell-{colName}', where colName is any column name (not field name!)
        [name in keyof Cols as name extends string ? `cell-${name}` : never]: (arg: TableCell<RowType, Cols[name]>) => VNode[];
      };
    };
  }
}
